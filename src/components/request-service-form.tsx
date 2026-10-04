import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { requestsApi, usersApi, type ProviderRole, type PublicUser } from '@/api';
import type { ProviderSummary } from '@/api/users';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RadioGroup } from '@/components/ui/radio-group';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { StarRating } from '@/components/ui/star-rating';
import { errorMessage } from '@/constants/roles';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';

const SERVICE_OPTIONS = [
  { value: 'listener', label: 'Listener', icon: 'listener', description: 'One-on-one, someone hears you out.' },
  { value: 'moderator', label: 'Moderator', icon: 'moderator', description: 'A group chat with a neutral referee.' },
] as const;

const displayName = (user: PublicUser) => user.profile.name || user.username;
const searchText = (user: PublicUser) => `${user.profile.name} ${user.username}`;

function listNames(names: string[]) {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function RequestServiceForm() {
  const theme = useTheme();
  const [service, setService] = useState<ProviderRole>('listener');
  const [providerIds, setProviderIds] = useState<string[]>([]);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ provider?: string; participants?: string; form?: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const providers = useApi(() => usersApi.listProviders(service), `providers:${service}`);
  const users = useApi(() => usersApi.searchUsers(), 'participants');
  const isModerator = service === 'moderator';
  const serviceLabel = isModerator ? 'moderator' : 'listener';

  const changeService = (next: ProviderRole) => {
    setService(next);
    setProviderIds([]);
    setParticipantIds([]);
    setErrors({});
  };

  const confirm = async () => {
    const found: typeof errors = {};
    if (providerIds.length === 0) found.provider = `Select a ${serviceLabel}.`;
    if (isModerator && participantIds.length === 0) found.participants = 'Add at least one other user.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSuccess(null);
    try {
      if (isModerator) {
        const result = await requestsApi.createModerateRequest(providerIds[0], participantIds);
        setSuccess(
          `Request sent to moderator ${result.providerNames[0]} and participants ${listNames(result.participantNames)}.`,
        );
      } else {
        const result = await requestsApi.createListenRequests(providerIds);
        setSuccess(
          `Request sent to ${result.providerNames.length > 1 ? 'listeners' : 'listener'} ${listNames(result.providerNames)}.`,
        );
      }
      setProviderIds([]);
      setParticipantIds([]);
    } catch (e) {
      setErrors({ form: errorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <ThemedText type="smallBold">Select Service</ThemedText>
        <RadioGroup options={SERVICE_OPTIONS} value={service} onChange={changeService} />
      </View>

      <SearchableSelect<ProviderSummary>
        label={`Select ${isModerator ? 'Moderator' : 'Listener'}`}
        placeholder={isModerator ? 'Choose a moderator' : 'Choose one or more listeners'}
        items={providers.data}
        loading={providers.loading}
        multiple={!isModerator}
        selected={providerIds}
        onChange={(keys) => {
          setProviderIds(keys);
          setErrors((e) => ({ ...e, provider: undefined }));
          setSuccess(null);
        }}
        getKey={(p) => p.id}
        getLabel={displayName}
        getSearchText={searchText}
        error={errors.provider}
        emptyText={`No ${serviceLabel}s available right now.`}
        renderItem={(p) => <ProviderRow provider={p} />}
      />

      {isModerator && (
        <SearchableSelect<PublicUser>
          label="Participants"
          placeholder="Add the other people in this conversation"
          items={users.data}
          loading={users.loading}
          multiple
          selected={participantIds}
          onChange={(keys) => {
            setParticipantIds(keys);
            setErrors((e) => ({ ...e, participants: undefined }));
            setSuccess(null);
          }}
          getKey={(u) => u.id}
          getLabel={(u) => `${displayName(u)} (@${u.username})`}
          getSearchText={searchText}
          error={errors.participants}
          renderItem={(u) => (
            <View style={styles.personRow}>
              <Avatar user={u} size={36} />
              <View style={styles.personText}>
                <ThemedText type="smallBold">{displayName(u)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  @{u.username}
                </ThemedText>
              </View>
            </View>
          )}
        />
      )}

      {isModerator && (
        <ThemedText type="small" themeColor="textSecondary">
          Each participant must accept before the moderator is asked.
        </ThemedText>
      )}

      {errors.form && <ThemedText style={{ color: theme.danger }}>{errors.form}</ThemedText>}

      <Button title="Confirm" onPress={confirm} loading={submitting} />

      {success && (
        <ThemedView type="backgroundElement" style={[styles.success, { borderColor: theme.success }]}>
          <Icon name="check" color="success" />
          <View style={styles.personText}>
            <ThemedText type="small">{success}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              It will open in Chatrooms once everyone approves.
            </ThemedText>
          </View>
        </ThemedView>
      )}

      <Link href="/chats" style={styles.link}>
        <ThemedText type="linkPrimary">Go to my chatrooms →</ThemedText>
      </Link>
    </View>
  );
}

function ProviderRow({ provider }: { provider: ProviderSummary }) {
  return (
    <View style={styles.personRow}>
      <Avatar user={provider} size={40} />
      <View style={styles.personText}>
        <ThemedText type="smallBold">{displayName(provider)}</ThemedText>
        <View style={styles.ratingRow}>
          <StarRating value={provider.rating.average ?? 0} size={13} />
          <ThemedText type="small" themeColor="textSecondary">
            {provider.rating.average ? `${provider.rating.average.toFixed(1)} (${provider.rating.count})` : 'New'}
          </ThemedText>
        </View>
        {provider.profile.expertise.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {provider.profile.expertise.join(' · ')}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  block: {
    gap: Spacing.two,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  personText: {
    flex: 1,
    gap: Spacing.half,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  success: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  link: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
});

import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ApiError, type Role } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { errorMessage, ROLE_OPTIONS } from '@/constants/roles';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session';

type Field = 'username' | 'email' | 'password' | 'confirm';
type Errors = Partial<Record<Field | 'form', string>>;

const MIN_PASSWORD = 8;

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(values.username.trim())) {
    errors.username = 'Use 3–20 letters, numbers, dots or underscores.';
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email.';
  if (values.password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.';
  return errors;
}

export default function SignupScreen() {
  const { signUp } = useSession();
  const theme = useTheme();
  const [values, setValues] = useState<Record<Field, string>>({ username: '', email: '', password: '', confirm: '' });
  const [role, setRole] = useState<Role>('user');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    setErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
  };

  const submit = async () => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    try {
      await signUp({ username: values.username, email: values.email, password: values.password, role });
    } catch (e) {
      // Uniqueness is checked by the API; show it under the field it concerns.
      if (e instanceof ApiError && e.code === 'username_taken') setErrors({ username: e.message });
      else if (e instanceof ApiError && e.code === 'email_taken') setErrors({ email: e.message });
      else setErrors({ form: errorMessage(e) });
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Create account</ThemedText>
        <ThemedText themeColor="textSecondary">Join as a user, listener or moderator.</ThemedText>
      </View>

      <TextField
        label="Username"
        value={values.username}
        onChangeText={set('username')}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
      />
      <TextField
        label="Email"
        value={values.email}
        onChangeText={set('email')}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <SegmentedControl label="Type" options={ROLE_OPTIONS} value={role} onChange={setRole} />
      <TextField
        label="Password"
        value={values.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm password"
        value={values.confirm}
        onChangeText={set('confirm')}
        error={errors.confirm}
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={submit}
      />

      {errors.form && <ThemedText style={{ color: theme.danger }}>{errors.form}</ThemedText>}

      <Button title="Sign up" onPress={submit} loading={submitting} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Already a member?
        </ThemedText>
        <Link href="/login" replace>
          <ThemedText type="linkPrimary">Log in</ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    maxWidth: 480,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
});

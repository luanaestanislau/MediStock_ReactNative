import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthHeader } from '../components/AuthHeader';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors } from '../theme/colors';
import { resolveDomain } from '../config/domains';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, error, loading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const domain = useMemo(() => resolveDomain(email), [email]);

  const onLogin = async () => {
    const success = await login(email.trim(), password);
    if (success) {
      navigation.reset({ index: 0, routes: [{ name: 'Matricula' }] });
    }
  };

  return (
    <LoadingOverlay loading={loading}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={{ marginBottom: 32 }}>
            <AuthHeader
              icon="business-outline"
              titulo="Acesso institucional"
              subtitulo="Use o e-mail fornecido pelo hospital"
            />
          </View>

          <Text style={styles.label}>Email institucional</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seunome@hospital.dominio"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          {domain ? (
            <Text style={[styles.domain, { color: domain.valid ? colors.success : colors.danger }]}>
              {domain.valid ? `Domínio reconhecido - ${domain.label}` : 'Domínio não autorizado'}
            </Text>
          ) : null}

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry={!visible}
              style={[styles.input, styles.passwordInput]}
            />
            <Pressable onPress={() => setVisible((current) => !current)} style={styles.eyeButton}>
              <Text style={styles.eye}>{visible ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Text style={styles.helper}>Não tem uma conta?</Text>
            <Pressable onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.link}>Cadastre-se</Text>
            </Pressable>
          </View>

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={onLogin}
            disabled={loading}
            style={[styles.primaryButton, loading && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>Verificar e continuar</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    </LoadingOverlay>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 0,
  },
  back: {
    color: colors.primarySoft,
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 0,
    paddingBottom: 32,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '500',
    color: colors.primarySoftBg,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#111827',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  domain: {
    marginTop: 4,
    fontSize: 11,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    fontSize: 18,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  helper: {
    color: 'rgba(255,255,255,0.7)',
  },
  link: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  error: {
    marginTop: 8,
    color: colors.danger,
  },
});

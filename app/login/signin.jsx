import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { auth } from '../../config/FirebaseConfig';
import { setLocalStorage } from '../../service/Storage';

export const options = {
  headerShown: false,
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const onSignIn = () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please enter your email and password.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (UserCredential) => {
        const user = UserCredential.user;
        await setLocalStorage('userDetail', user);
        router.replace('/(tabs)');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          Alert.alert('Login Failed', 'Invalid email or password.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'Please enter a valid email address.');
        } else {
          Alert.alert('Login Failed', error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#56CCF2', '#2F80ED']} style={styles.container}>
            <View style={styles.panelWrapper}>
              <View style={styles.glassPanel}>
                <Text style={styles.textHeader}>Welcome Back</Text>
                <Text style={styles.subText}>Please sign in to continue</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#bbdefb"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor="#00e0ff"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#bbdefb"
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      selectionColor="#00e0ff"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                      <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#e0f7fa" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onSignIn}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={[styles.buttonWrapper, loading && { opacity: 0.6 }]}
                >
                  <LinearGradient colors={['#43C6AC', '#2F80ED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
                    <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signUpRedirect} onPress={() => router.push('login/signUp')} activeOpacity={0.8}>
                  <Text style={styles.signUpRedirectText}>Have not an account? Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelWrapper: {
    width: '90%',
    borderRadius: 25,
    shadowColor: '#00e0ff',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  glassPanel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  textHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e0f7fa',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginTop: 15,
  },
  label: {
    color: '#e0f7fa',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#43C6AC',
    borderRadius: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.12)',
    fontWeight: '600',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#43C6AC',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  eyeIcon: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  buttonWrapper: {
    marginTop: 28,
    borderRadius: 60,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#00e0ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 60,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  signUpRedirect: {
    marginTop: 20,
  },
  signUpRedirectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bbdefb',
    textAlign: 'center',
  },
});

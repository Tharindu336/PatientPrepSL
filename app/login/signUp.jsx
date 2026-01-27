import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onCreateAccount = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Oops!', 'Please fill in all fields to continue.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: trimmedName });

      await setLocalStorage('userDetail', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      Alert.alert('Success', 'Account created successfully!');
      router.push('(tabs)');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email Already Registered', 'This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Signup Failed', error.message || 'Something went wrong.');
      }
    }
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
                <Text style={styles.textHeader}>Create Your Account</Text>
                <Text style={styles.subText}>Join PatientPrep SL and take control of your health</Text>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#fff"
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    selectionColor="#fff"
                    cursorColor="#fff"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#fff"
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor="#fff"
                    cursorColor="#fff"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      placeholder="Create a password"
                      placeholderTextColor="#fff"
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      selectionColor="#fff"
                      cursorColor="#fff"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={22}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  onPress={onCreateAccount}
                  activeOpacity={0.85}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={['#4aa3df', '#1d6fa5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Create Account</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Sign In Redirect */}
                <TouchableOpacity
                  style={styles.signInRedirect}
                  onPress={() => router.push('/login/signin')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signInRedirectText}>Already have an account? Sign In</Text>
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
    shadowColor: '#4aa3df',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 10,
  },
  glassPanel: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  textHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e0f0ff',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginTop: 15,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#a0c4ff',
    borderRadius: 12,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(15, 52, 96, 0.6)',
    fontWeight: '600',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0c4ff',
    borderRadius: 12,
    backgroundColor: 'rgba(15, 52, 96, 0.6)',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
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
    shadowColor: '#1d6fa5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 60,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#e0f0ff',
    letterSpacing: 0.6,
  },
  signInRedirect: {
    marginTop: 20,
  },
  signInRedirectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d0e8ff',
    textAlign: 'center',
  },
});

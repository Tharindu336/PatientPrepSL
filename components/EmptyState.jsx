import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ConstantString from '../constant/ConstantString';

export default function EmptyState() {
  const router = useRouter();

  return (
    <View
      style={{
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
      }}
    >
      <Image
        source={require('./../assets/images/medicine.png')}
        style={{
          height: 120,
          width: 120,
        }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginTop: 30,
          textAlign: 'center',
        }}
      >
        No Medication!
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: 'gray',
          textAlign: 'center',
          marginTop: 15,
        }}
      >
        {ConstantString.MedicationSubText}
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#00bfff',
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 10,
          marginTop: 30,
        }}
        onPress={() => router.push('/add-new-medication')}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {ConstantString.AddNewMedicationButton}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TypeList, WhenToTake } from '../../constant/Options';

export default function AddNewMedication() {
  const [formData, setFormData] = useState({
    symptoms: '',
    consultation: '',
    doctorName: '',
    name: '',
    type: null,
    dose: '',
    when: '',
    startDate: null,
    endDate: null,
  });

  const [showPicker, setShowPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onHandleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Field changed: ${field}`, value);
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  const formatDate = date => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios'); // keep open on iOS
    if (event.type === 'set' && selectedDate) {
      onHandleInputChange('startDate', selectedDate);
      console.log('Start Date selected:', selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      onHandleInputChange('endDate', selectedDate);
      console.log('End Date selected:', selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Image
          style={{
            height: 150,
            width: '100%',
          }}
          source={require('../../assets/images/consult.png')}
        />

        <View>
          <Text style={styles.header}>Add New Information</Text>
        </View>

        {/* Symptoms */}
        <View style={styles.inputGroup}>
          <MaterialIcons style={styles.icon} name="sick" size={24} />
          <TextInput
            style={styles.textInput}
            placeholder="Symptoms"
            value={formData.symptoms}
            onChangeText={value => onHandleInputChange('symptoms', value)}
          />
        </View>

        {/* Consultation */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="book-outline" size={24} />
          <TextInput
            style={styles.textInput}
            placeholder="Consultation"
            value={formData.consultation}
            onChangeText={value => onHandleInputChange('consultation', value)}
          />
        </View>

        {/* Doctor's Name */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="person-outline" size={24} />
          <TextInput
            style={styles.textInput}
            placeholder="Doctor's Name"
            value={formData.doctorName}
            onChangeText={value => onHandleInputChange('doctorName', value)}
          />
        </View>

        {/* Medicine Name */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="medkit-outline" size={24} />
          <TextInput
            style={styles.textInput}
            placeholder="Medicine Name"
            value={formData.name}
            onChangeText={value => onHandleInputChange('name', value)}
          />
        </View>

        {/* Type Selection */}
        <FlatList
          data={TypeList}
          horizontal
          style={{ marginTop: 10 }}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onHandleInputChange('type', item)}
              style={[
                styles.typeItem,
                {
                  backgroundColor: formData?.type?.name === item.name ? '#cce5ff' : '#fff',
                  borderColor: formData?.type?.name === item.name ? '#3399ff' : '#3E3B33',
                },
              ]}
            >
              <Text style={styles.typeText}>{item?.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Dose */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="eyedrop-outline" size={24} />
          <TextInput
            style={styles.textInput}
            placeholder="Dose Ex: 2.5ml"
            value={formData.dose}
            onChangeText={value => onHandleInputChange('dose', value)}
          />
        </View>

        {/* When To Take (Custom Picker) */}
        <TouchableOpacity
          onPress={() => setShowPicker(!showPicker)}
          style={styles.inputGroup}
          activeOpacity={0.8}
        >
          <Ionicons style={styles.icon} name="time-outline" size={20} />
          <Text style={styles.selectedText}>
            {formData.when ? formData.when : 'Select time...'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.when}
              onValueChange={itemValue => {
                onHandleInputChange('when', itemValue);
                setShowPicker(false);
              }}
              style={styles.nativePicker}
              dropdownIconColor="#00bfff"
            >
              <Picker.Item label="" value="" />
              {WhenToTake.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
          </View>
        )}

        {/* Start Date */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="calendar-outline" size={24} />
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            style={{ flex: 1 }}
          >
            <Text style={[styles.selectedText, { color: formData.startDate ? '#000' : '#999' }]}>
              {formData.startDate ? formatDate(formData.startDate) : 'Select Start Date'}
            </Text>
          </TouchableOpacity>
          {formData.startDate && (
            <TouchableOpacity
              onPress={() => onHandleInputChange('startDate', null)}
              style={styles.removeButton}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={formData.startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
          />
        )}

        {/* End Date */}
        <View style={styles.inputGroup}>
          <Ionicons style={styles.icon} name="calendar-outline" size={24} />
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(true)}
            style={{ flex: 1 }}
          >
            <Text style={[styles.selectedText, { color: formData.endDate ? '#000' : '#999' }]}>
              {formData.endDate ? formatDate(formData.endDate) : 'Select End Date'}
            </Text>
          </TouchableOpacity>
          {formData.endDate && (
            <TouchableOpacity
              onPress={() => onHandleInputChange('endDate', null)}
              style={styles.removeButton}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        {showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndDateChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#3E3B33',
    marginTop: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  icon: {
    color: '#00bfff',
    borderRightWidth: 1,
    paddingRight: 10,
  },
  typeItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    marginLeft: 20,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
  },
  selectedText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 5,
    overflow: 'hidden',
  },
  nativePicker: {
    height: Platform.OS === 'android' ? 50 : undefined,
    width: '100%',
  },
  removeButton: {
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

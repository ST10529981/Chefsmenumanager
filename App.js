import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// ---------- Theme ----------
const COLORS = {
  pine: '#14352B',
  pineSoft: '#E3ECE7',
  page: '#F2F5F3',
  card: '#FFFFFF',
  paprika: '#C8442B',
  ink: '#1D2421',
  muted: '#66726C',
  line: '#D3DCD7',
  success: '#1E7A4F',
  successBg: '#DDF1E6',
  errorBg: '#FBE5E0',
};

const COURSES = ['Starter', 'Main', 'Dessert'];

const COURSE_COLORS = {
  Starter: '#3E7C59',
  Main: '#C8442B',
  Dessert: '#8A5A9E',
};

// ---------- Helpers ----------
const formatPrice = (value) => `R${Number(value).toFixed(2)}`;

// ---------- Components ----------
function Field({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function MenuCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: COURSE_COLORS[item.course] }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.dishName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={[styles.badge, { backgroundColor: COURSE_COLORS[item.course] }]}>
          <Text style={styles.badgeText}>{item.course}</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No menu items yet</Text>
      <Text style={styles.emptyText}>
        Fill in the form above and tap "Add to menu" to create your first dish.
      </Text>
    </View>
  );
}

// ---------- Main App ----------
export default function App() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [confirmation, setConfirmation] = useState('');
  const nextId = useRef(1);
  const confirmTimer = useRef(null);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Enter the dish name.';
    if (!description.trim()) e.description = 'Enter a short description.';
    if (!course) e.course = 'Select a course.';
    const trimmedPrice = price.trim().replace(',', '.');
    if (!trimmedPrice) {
      e.price = 'Enter a price.';
    } else if (isNaN(Number(trimmedPrice))) {
      e.price = 'Price must be a number, e.g. 85 or 85.50.';
    } else if (Number(trimmedPrice) <= 0) {
      e.price = 'Price must be greater than 0.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const newItem = {
      id: String(nextId.current++),
      name: name.trim(),
      description: description.trim(),
      course,
      price: Number(price.trim().replace(',', '.')),
    };

    // Newest item shown first; the list re-renders automatically.
    setItems((prev) => [newItem, ...prev]);

    setName('');
    setDescription('');
    setCourse('');
    setPrice('');
    setErrors({});

    const msg = `"${newItem.name}" was added to the menu.`;
    setConfirmation(msg);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmation(''), 4000);
    if (Platform.OS !== 'web') Alert.alert('Menu item added', msg);
  };

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const header = (
    <View>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Chef's Menu Manager</Text>
        <Text style={styles.appSubtitle}>Add dishes and see your menu take shape.</Text>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>New menu item</Text>

        <Field label="Dish name" error={errors.name}>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Peri-peri prawns"
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={(t) => {
              setName(t);
              clearError('name');
            }}
          />
        </Field>

        <Field label="Description" error={errors.description}>
          <TextInput
            style={[styles.input, styles.multiline, errors.description && styles.inputError]}
            placeholder="Ingredients, style, or what makes it special"
            placeholderTextColor={COLORS.muted}
            value={description}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            onChangeText={(t) => {
              setDescription(t);
              clearError('description');
            }}
          />
        </Field>

        <Field label="Course" error={errors.course}>
          <View style={styles.chipRow}>
            {COURSES.map((c) => {
              const selected = course === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => {
                    setCourse(c);
                    clearError('course');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <Field label="Price (R)" error={errors.price}>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            placeholder="e.g. 85.00"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
            value={price}
            onChangeText={(t) => {
              setPrice(t);
              clearError('price');
            }}
          />
        </Field>

        {confirmation ? (
          <View style={styles.confirmBanner}>
            <Text style={styles.confirmText}>{confirmation}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleAdd} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Add to menu</Text>
        </TouchableOpacity>
      </View>

      {/* List heading */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Current menu</Text>
        <Text style={styles.count}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MenuCard item={item} />}
            ListHeaderComponent={header}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.page },
  listContent: { padding: 16, paddingBottom: 40 },

  header: {
    backgroundColor: COLORS.pine,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  appTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  appSubtitle: { color: '#BFD3C9', fontSize: 14, marginTop: 4 },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginBottom: 12 },

  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.ink, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.ink,
    backgroundColor: '#FAFCFB',
  },
  multiline: { minHeight: 80 },
  inputError: { borderColor: COLORS.paprika, backgroundColor: COLORS.errorBg },
  errorText: { color: COLORS.paprika, fontSize: 13, marginTop: 4 },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    backgroundColor: '#FAFCFB',
  },
  chipSelected: { backgroundColor: COLORS.pine, borderColor: COLORS.pine },
  chipText: { fontSize: 15, color: COLORS.ink, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF' },

  confirmBanner: {
    backgroundColor: COLORS.successBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  confirmText: { color: COLORS.success, fontSize: 14, fontWeight: '600' },

  button: {
    backgroundColor: COLORS.paprika,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  count: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardStripe: { width: 6 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  dishName: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.ink },
  price: { fontSize: 17, fontWeight: '700', color: COLORS.pine },
  description: { fontSize: 14, color: COLORS.muted, marginTop: 6, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  empty: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.line,
    backgroundColor: COLORS.pineSoft,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.pine, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});

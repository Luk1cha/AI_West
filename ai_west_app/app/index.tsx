// Assistant.tsx - სენსორების ავტომატური ჩატვირთვით
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Import Firebase Realtime Database
import { ref as dbRef, onValue } from 'firebase/database';
import { dbSensor as realtimeDB } from '../services/firebase'; // Your existing firebase config

// -------------------- CONFIG --------------------
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
if (!OPENAI_API_KEY) { console.error('OpenAI API key not configured'); }
const FIREBASE_CONFIG = (global as any).FIREBASE_CONFIG || null;
const ASSISTANT_NAME = 'AgroNiko AI';
const CROP = 'თხილი';

// ---------------- Interfaces --------------------
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sensorData?: SensorData;
}

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLevel?: number;
  ph?: number;
  timestamp: string;
}

interface GardenInfo {
  area?: string;
  treeCount?: number;
  soilType?: string;
  irrigationSystem?: string;
  lastFertilization?: string;
  notes?: string;
  location?: string;
  plantingDate?: string;
  variety?: string;
  [key: string]: any;
}

interface AssistantProps {
  gardenInfo?: GardenInfo | null;
}

// -------------- Initialize Firebase Firestore ------------
let firestoreDB: any = null;
if (FIREBASE_CONFIG && !getApps().length) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    firestoreDB = getFirestore(app);
  } catch (e) {
    console.warn('Firebase init failed', e);
  }
}

// -------------------- Component --------------------
export default function Assistant({ gardenInfo }: AssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `${ASSISTANT_NAME}: გამარჯობა! მე ვარ თხილის აგრონომიული ასისტენტი. შეგიძლია მკითხო მორწყვის, სასუქების, მავნებლების, დაავადებების ან სენსორული მონაცემების შესახებ — გიპასუხებ ქართულად და პრაქტიკულად.`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSensor, setIsFetchingSensor] = useState(false);
  const [currentSensorData, setCurrentSensorData] = useState<any>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages]);

  // Listen to real-time sensor data from Firebase Realtime Database
  useEffect(() => {
    const sensorsRef = dbRef(realtimeDB, 'data');
    
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentSensorData({
          temperature: Number(data.temperature) || 0,
          humidity: Number(data.humidity) || 0,
          soilMoisture: Number(data.soilMoisturePercent) || 0,
          light: Number(data.light) || 0,
          timestamp: new Date().toISOString()
        });
      }
    }, (error) => {
      console.error('Firebase realtime error:', error);
    });

    return () => unsubscribe();
  }, []);

  // -------------------- FETCH LIVE SENSOR DATA & ANALYZE --------------------
  const handleFetchLiveSensorAndAnalyze = async () => {
    if (!currentSensorData) {
      Alert.alert('სენსორი', 'სენსორების მონაცემები ჯერ არ არის ხელმისაწვდომი. გთხოვთ დაელოდოთ.');
      return;
    }

    setIsFetchingSensor(true);

    // Format sensor data for display
    const sensorDisplay: SensorData = {
      temperature: currentSensorData.temperature,
      humidity: currentSensorData.humidity,
      soilMoisture: currentSensorData.soilMoisture,
      lightLevel: currentSensorData.light,
      timestamp: currentSensorData.timestamp
    };

    // Create formatted message
    const formattedMessage = `📊 ჩემი ბაღის პირდაპირი მონაცემები:\n\n` +
      `🌡️ ტემპერატურა: ${sensorDisplay.temperature.toFixed(1)}°C\n` +
      `💧 ჰაერის ნესტი: ${sensorDisplay.humidity.toFixed(0)}%\n` +
      `🌱 მიწის ტენიანობა: ${sensorDisplay.soilMoisture.toFixed(0)}%\n` +
      `☀️ სინათლის დონე: ${sensorDisplay.lightLevel}\n` +
      `⏰ დრო: ${new Date(sensorDisplay.timestamp).toLocaleString('ka-GE')}\n\n` +
      `გთხოვ, დეტალურად გააანალიზო ეს მონაცემები და მომეცი კონკრეტული რეკომენდაციები თხილის ბაღის მოვლისთვის.`;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: formattedMessage,
      timestamp: new Date(),
      sensorData: sensorDisplay
    }]);

    setIsLoading(true);

    try {
      // Build AI prompt
      const prompt = buildAIPromptWithSensor(sensorDisplay, 'გთხოვ, დეტალურად გააანალიზო ეს მონაცემები და მომეცი კონკრეტული რეკომენდაციები: 1) მორწყვის გეგმა, 2) საჭირო ღონისძიებები, 3) რისკები და გაფრთხილებები.');
      
      const aiReply = await callOpenAI(prompt);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date(),
        sensorData: sensorDisplay
      }]);
    } catch (err) {
      console.warn('AI failed, using local fallback:', err);
      const fallback = generateDetailedLocalAnalysis(sensorDisplay);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date(),
        sensorData: sensorDisplay
      }]);
    } finally {
      setIsLoading(false);
      setIsFetchingSensor(false);
    }
  };

  // -------------------- BUILD AI PROMPT --------------------
  const buildAIPromptWithSensor = (sensor: SensorData | null, userQuestion: string | null) => {
    const systemPrompt = `თქვენ ხართ ქართველი აგრონომი თხილის სპეციალისტი. გთხოვთ უპასუხოთ ქართულად, პრაქტიკულად და დეტალურად, ყურადღება მიაქციეთ მორწყვის გეგმის, სასუქების, დაავადებებისა და მავნებლების მართვის რეკომენდაციებს. ზუსტი რეკომენდაცია რაოდენობებით
- გაფრთხილება ან შენიშვნა (თუ საჭიროა)`;

    const sensorBlock = sensor ? `
--- სენსორის მონაცემები ---
მიწის ტენიანობა: ${sensor.soilMoisture}%
ტემპერატურა: ${sensor.temperature}°C
ჰაერის ნესტი: ${sensor.humidity}%
${sensor.lightLevel ? `სინათლის დონე: ${sensor.lightLevel}\n` : ''}
${sensor.ph ? `pH: ${sensor.ph}\n` : ''}
დრო: ${sensor.timestamp}
` : '';

    const userBlock = userQuestion ? `\n--- კითხვა ---\n${userQuestion}\n` : '';

    return `${systemPrompt}${sensorBlock}${userBlock}\n\nდეტალური პრაქტიკული რეკომენდაცია ქართულად:`;
  };

  // -------------------- CALL OPENAI --------------------
  const callOpenAI = async (prompt: string): Promise<string> => {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant specialized in agricultural advice for walnut trees in Georgian language.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.2
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`OpenAI error: ${res.status}`);
    }

    const json = await res.json();
    return json?.choices?.[0]?.message?.content?.trim() || '';
  };

  // -------------------- DETAILED LOCAL ANALYSIS --------------------
  const generateDetailedLocalAnalysis = (sensor: SensorData): string => {
    let analysis = `📊 თხილის ბაღის დეტალური ანალიზი\n`;
    analysis += `⏰ ${new Date(sensor.timestamp).toLocaleString('ka-GE')}\n\n`;

    // Soil moisture
    analysis += `💧 მიწის ტენიანობა: ${sensor.soilMoisture}%\n`;
    if (sensor.soilMoisture < 30) {
      analysis += `🚨 ᲙᲠᲘᲢᲘᲙᲣᲚᲘ: დაუყოვნებლივ საჭიროა მორწყვა!\n`;
      analysis += `📋 ქმედება: 15-25 ლიტრი წყალი თითო ხეზე დღეს, შემდეგ ყოველდღიური მონიტორინგი.\n\n`;
    } else if (sensor.soilMoisture < 50) {
      analysis += `⚠️ ᲓᲐᲑᲐᲚᲘ: მორწყვა საჭიროა 1-2 დღეში.\n`;
      analysis += `📋 ქმედება: 10-15 ლიტრი წყალი/ხე, წვეთოვანი სისტემით 2-3 საათი.\n\n`;
    } else if (sensor.soilMoisture > 70) {
      analysis += `💦 ᲛᲐᲦᲐᲚᲘ: შეამცირეთ მორწყვა, სოკოვანი დაავადების რისკი!\n`;
      analysis += `📋 ქმედება: გააუმჯობესეთ დრენაჟი, შეამოწმეთ ფესვები.\n\n`;
    } else {
      analysis += `✅ ᲝᲞᲢᲘᲛᲐᲚᲣᲠᲘ: ტენიანობა კარგ დიაპაზონშია (50-70%).\n\n`;
    }

    // Temperature
    analysis += `🌡️ ტემპერატურა: ${sensor.temperature}°C\n`;
    if (sensor.temperature < 10) {
      analysis += `❄️ ᲓᲐᲑᲐᲚᲘ: ყინვის რისკი, თხილის ყვავილები დაზიანდება!\n`;
      analysis += `📋 ქმედება: დაფარეთ ახალგაზრდა ხეები, განიხილეთ დამცავი სპრეი.\n\n`;
    } else if (sensor.temperature > 32) {
      analysis += `🔥 ᲛᲐᲦᲐᲚᲘ: სითბური სტრესი!\n`;
      analysis += `📋 ქმედება: გაზარდეთ მორწყვა 30-40%, მულჩირება, ჩრდილი.\n\n`;
    } else if (sensor.temperature > 28) {
      analysis += `☀️ თბილი: გაზრდილი ტრანსპირაცია.\n`;
      analysis += `📋 ქმედება: რეგულარული მორწყვა, მონიტორინგი.\n\n`;
    } else {
      analysis += `✅ ᲝᲞᲢᲘᲛᲐᲚᲣᲠᲘ: იდეალური ტემპერატურა თხილისთვის (15-28°C).\n\n`;
    }

    // Humidity
    analysis += `💨 ჰაერის ნესტი: ${sensor.humidity}%\n`;
    if (sensor.humidity > 75) {
      analysis += `⚠️ ᲛᲐᲦᲐᲚᲘ: სოკოვანი დაავადებების რისკი!\n`;
      analysis += `📋 ქმედება:\n`;
      analysis += `  • შეამოწმეთ ფოთლები ყავისფერ ლაქებზე\n`;
      analysis += `  • ფუნგიციდი: Bordeaux mixture 100გ/10ლ წყალი\n`;
      analysis += `  • გააუმჯობესეთ ვენტილაცია\n\n`;
    } else if (sensor.humidity < 30) {
      analysis += `🌬️ ᲓᲐᲑᲐᲚᲘ: მშრალი ჰაერი.\n`;
      analysis += `📋 ქმედება: გაზარდეთ მორწყვა, განიხილეთ ნისლის სისტემა.\n\n`;
    } else {
      analysis += `✅ ᲜᲝᲠᲛᲐᲚᲣᲠᲘ: კარგი დიაპაზონი (30-70%).\n\n`;
    }

    // Light
    if (sensor.lightLevel !== undefined) {
      analysis += `☀️ სინათლის დონე: ${sensor.lightLevel}\n`;
      if (sensor.lightLevel < 500) {
        analysis += `🌙 ᲑᲜᲔᲚᲘ: არასაკმარისი სინათლე!\n`;
        analysis += `📋 ქმედება: მოიშორეთ ჩრდილი აგდებული ტოტები.\n\n`;
      } else if (sensor.lightLevel < 1500) {
        analysis += `🌤️ ᲓᲐᲑᲐᲚᲘ: თხილს სჭირდება მეტი მზე.\n\n`;
      } else {
        analysis += `✅ ᲙᲐᲠᲒᲘ: საკმარისი სინათლე ფოტოსინთეზისთვის.\n\n`;
      }
    }

    // Recommendations
    analysis += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `📌 კონკრეტული რეკომენდაციები:\n\n`;

    analysis += `1️⃣ მორწყვის გეგმა (შემდეგი 7 დღე):\n`;
    if (sensor.soilMoisture < 40) {
      analysis += `   • დღეს: 15-20ლ/ხე დაუყოვნებლივ\n`;
      analysis += `   • მომდევნო 3 დღე: ყოველდღე 10ლ/ხე\n`;
      analysis += `   • შემდეგ: ყოველ 2 დღეში 10ლ/ხე\n\n`;
    } else if (sensor.soilMoisture < 55) {
      analysis += `   • ყოველ 2-3 დღეში: 10-15ლ/ხე\n`;
      analysis += `   • დილით 6-9 საათამდე\n\n`;
    } else {
      analysis += `   • შეაჩერეთ მორწყვა 3-4 დღით\n`;
      analysis += `   • შემდეგ: ყოველ 4-5 დღეში 8-10ლ/ხე\n\n`;
    }

    analysis += `2️⃣ სასუქი:\n`;
    analysis += `   • NPK 10-10-10: 200გ/ხე\n`;
    analysis += `   • ორგანული ნაკელი: 5კგ/ხე\n\n`;

    analysis += `3️⃣ გადაუდებელი ქმედებები:\n`;
    if (sensor.soilMoisture < 35) analysis += `   • 🚨 მორწყვა ახლავე!\n`;
    if (sensor.temperature > 32) analysis += `   • 🌡️ მულჩირება და ჩრდილი\n`;
    if (sensor.humidity > 75) analysis += `   • 🍄 ფუნგიციდის შეფურცვლა\n`;
    if (sensor.lightLevel && sensor.lightLevel < 500) analysis += `   • ☀️ ტოტების გათხელება\n`;

    analysis += `\n💬 დამატებითი კითხვებისთვის, ჰკითხეთ!`;

    return analysis;
  };

  // -------------------- GARDEN INFO PASTE --------------------
  const handlePasteGardenInfo = async () => {
    if (!gardenInfo) {
      Alert.alert('ინფორმაცია', 'ბაღის ინფორმაცია არ არის ხელმისაწვდომი.');
      return;
    }

    const formattedInfo = formatGardenInfoForChat(gardenInfo);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: formattedInfo,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const prompt = buildAIPromptWithSensor(null, formattedInfo);
      const aiReply = await callOpenAI(prompt);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.warn('AI failed:', err);
      const fallback = generateGardenAnalysis(gardenInfo);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: fallback,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatGardenInfoForChat = (info: GardenInfo): string => {
    let formatted = '🌳 ჩემი ბაღის ინფორმაცია:\n\n';
    if (info.area) formatted += `📏 ფართობი: ${info.area}\n`;
    if (info.treeCount) formatted += `🌲 ხეების რაოდენობა: ${info.treeCount}\n`;
    if (info.variety) formatted += `🌱 ჯიში: ${info.variety}\n`;
    if (info.soilType) formatted += `🏔️ ნიადაგის ტიპი: ${info.soilType}\n`;
    if (info.irrigationSystem) formatted += `💧 მორწყვის სისტემა: ${info.irrigationSystem}\n`;
    formatted += '\nგთხოვ, გააანალიზო და მომეცი რეკომენდაციები.';
    return formatted;
  };

  const generateGardenAnalysis = (info: GardenInfo): string => {
    let analysis = '🌳 თქვენი ბაღის ანალიზი:\n\n';
    if (info.irrigationSystem === 'წვეთოვანი') {
      analysis += '💧 წვეთოვანი სისტემა შესანიშნავია თხილისთვის.\n';
    }
    analysis += '\n📋 ზოგადი რეკომენდაციები:\n';
    analysis += '• NPK 10-10-10, 150-250გ/ხე\n';
    analysis += '• მორწყვა: 50-60% ტენიანობა\n';
    return analysis;
  };

  // -------------------- SEND MESSAGE --------------------
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: trimmed, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const prompt = buildAIPromptWithSensor(null, trimmed);
      const aiReply = await callOpenAI(prompt);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.warn('AI failed:', err);
      const canned = generateCannedResponse(trimmed);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: canned,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCannedResponse = (q: string): string => {
    const s = q.toLowerCase();
    if (s.includes('მორწყვ')) {
      return `💧 მორწყვა თხილისთვის:\n- გაზაფხული: ყოველ 7-10 დღეში\n- ზაფხული: 5-7 დღეში\n- მიზანი: 50-60% ტენიანობა`;
    }
    if (s.includes('სასუქ')) {
      return `🌱 სასუქი:\n- გაზაფხული: NPK 10-10-10, 150-250გ/ხე\n- ზრდის პერიოდში: კალიუმის დანამატი`;
    }
    return `შეგიძლია მკითხო მორწყვის, სასუქების, ან მავნებლების შესახებ.`;
  };

  // -------------------- RENDER MESSAGE --------------------
  const renderMessage = (m: Message) => {
    const isUser = m.role === 'user';
    return (
      <View key={m.id} style={[styles.message, isUser ? styles.messageUser : styles.messageAssistant]}>
        <View style={styles.messageHeader}>
          <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
            <MaterialCommunityIcons name={isUser ? 'account' : 'robot'} size={16} color="#fff" />
          </View>
          <Text style={styles.sender}>{isUser ? 'თქვენ' : ASSISTANT_NAME}</Text>
          <Text style={styles.time}>{m.timestamp.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        {m.sensorData && (
          <View style={styles.sensorCard}>
            <Text style={styles.sensorTitle}>📊 სენსორის მონაცემები</Text>
            <Text style={styles.sensorText}>🌡 ტემპ: {m.sensorData.temperature}°C</Text>
            <Text style={styles.sensorText}>💧 ნესტი: {m.sensorData.humidity}%</Text>
            <Text style={styles.sensorText}>🌱 მიწა: {m.sensorData.soilMoisture}%</Text>
            {m.sensorData.lightLevel !== undefined && (
              <Text style={styles.sensorText}>☀️ სინათლე: {m.sensorData.lightLevel}</Text>
            )}
          </View>
        )}

        <Text style={styles.messageText}>{m.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot" size={28} color="#fff" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
          <Text style={styles.headerSubtitle}>თხილის აგრონომიული ასისტენტი</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={handleFetchLiveSensorAndAnalyze} 
          disabled={isFetchingSensor || !currentSensorData}
        >
          {isFetchingSensor ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialCommunityIcons name="finance" color="#fff" size={18} />
          )}
          <Text style={styles.btnText}>პირდაპირი ანალიზი</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnGarden]} 
          onPress={handlePasteGardenInfo}
          disabled={!gardenInfo || isLoading}
        >
          <MaterialCommunityIcons name="tree" color="#fff" size={18} />
          <Text style={styles.btnText}>ბაღის ინფო</Text>
        </TouchableOpacity>
      </View>

      {currentSensorData && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            პირდაპირი: {currentSensorData.temperature}°C • {currentSensorData.soilMoisture}% • {currentSensorData.humidity}%
          </Text>
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 12 }}>
        {messages.map(renderMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.loadingText}>AI ფიქრობს...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="დაწერეთ კითხვა..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]} 
          onPress={handleSendMessage} 
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f9f3' },
  header: { 
    padding: 16, 
    backgroundColor: '#10b981', 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#d1fae5', fontSize: 11 },
  controls: { 
    flexDirection: 'row', 
    padding: 12, 
    gap: 8, 
    justifyContent: 'space-between' 
  },
  btn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#2563eb', 
    padding: 12, 
    borderRadius: 10, 
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnGarden: { 
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  liveText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
  },
  chat: { flex: 1 },
  message: { 
    marginVertical: 8, 
    padding: 14, 
    borderRadius: 16, 
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageUser: { alignSelf: 'flex-end', backgroundColor: '#dbeafe' },
  messageAssistant: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarUser: { backgroundColor: '#3b82f6' },
  avatarAssistant: { backgroundColor: '#10b981' },
  sender: { fontWeight: '700', fontSize: 13, color: '#111827' },
  time: { marginLeft: 'auto', color: '#6b7280', fontSize: 10 },
  messageText: { 
    fontSize: 14, 
    color: '#1f2937', 
    lineHeight: 22,
  },
  sensorCard: { 
    backgroundColor: '#ecfdf5', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  sensorTitle: { fontWeight: '700', marginBottom: 8, fontSize: 12, color: '#065f46' },
  sensorText: { fontSize: 11, color: '#047857', marginBottom: 3 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  loadingText: { color: '#6b7280', fontSize: 12 },
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb', 
    gap: 10,
    backgroundColor: '#fff',
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f9fafb', 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#d1d5db',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: { 
    backgroundColor: '#10b981', 
    width: 48,
    height: 48,
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
});
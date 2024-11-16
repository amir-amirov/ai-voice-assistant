import { Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Voice from '@react-native-community/voice';
import { apiCall } from './src/api/openAI';

const App = () => {

  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState("")
  const [speaking, setSpeaking] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const ScrollViewRef = useRef()

  const speechStartHandler = () => {
    console.log('speech start handler')
  }

  const speechEndHandler = () => {
    setRecording(false)
    console.log('speech end handler')
  }

  const speechResultsHandler = (e: any) => {
    console.log('voice event: ', e)
    const text = e.value[0]
    setResult(text)
  }

  const speechErrorHandler = (e: any) => {
    console.log('speech error handler ', e)
  }

  const startRecording = async () => {
    setRecording(true)
    setSpeaking(!speaking)
    try {
      await Voice.start('en-GB')
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const stopRecording = async () => {
    setSpeaking(!speaking)
    try {
      await Voice.stop()
      setRecording(false)
      fetchResponse()
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const updateScrollView = () => {
    setTimeout(() => {
      ScrollViewRef?.current?.scrollToEnd({ animated: true })
    }, 200)
  }
  const fetchResponse = () => {
    if (result.trim().length > 0) {
      let newMessages = [...messages]
      newMessages.push({ role: 'user', content: result.trim() })
      setMessages([...newMessages])
      updateScrollView()
      setLoading(true)
      apiCall(result.trim(), newMessages).then(res => {
        console.log('got api data: ', res)
        setLoading(false)
        if (res) {
          setMessages([...res])
          updateScrollView()
          setResult('')
        } else {
          Alert.alert('Error')
        }
      })
    }
  }

  useEffect(() => {
    // voice handler  events
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler
    Voice.onSpeechError = speechErrorHandler

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./src/assets/welcome.png')} style={styles.chatbotIcon} />
      <ScrollView ref={ScrollViewRef} style={styles.chatContainer}>
        {messages.length > 0 ?
          messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.content.includes("http") ?
                <Image source={{ uri: message.content }} style={styles.messageImage} resizeMode='contain' />
                : <Text style={styles.messageText}>{message.content}</Text>
              }
            </View>
          ))
          : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "grey", fontSize: 25, fontWeight: "bold" }}>How I can help you today?</Text>
            </View>
          )
        }
      </ScrollView>
      <View style={styles.inputContainer}>
        {
          loading ? (
            <Image source={require("./src/assets/loading.gif")} style={styles.microphoneIcon} />
          )
            :
            speaking ? (
              <TouchableOpacity onPress={() => stopRecording()}>
                <Image source={require('./src/assets/voiceLoading.gif')} style={styles.microphoneIcon} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => startRecording()}>
                <Image source={require('./src/assets/recordingIcon.png')} style={styles.microphoneIcon} />
              </TouchableOpacity>
            )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  chatbotIcon: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  chatContainer: {
    flex: 0.7,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  microphoneIcon: {
    width: 80,
    height: 80,
    marginLeft: 10,
  },
});

export default App
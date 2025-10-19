//components/chat/MessageInput.js
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from './EmojiPicker';
import FilePicker from './FilePicker';
import FilePreview from './FilePreview';

const MessageInput = ({ conversationId }) => {
  const { sendMessage } = useChat();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const inputRef = useRef();

  const handleSendMessage = async () => {
    if (!messageText.trim() && selectedFiles.length === 0) {
      return;
    }

    try {
      let messageData = {
        conversation_id: conversationId,
        message_type: selectedFiles.length > 0 ? 'file' : 'text',
        content: messageText.trim(),
      };

      // Si des fichiers sont sélectionnés
      if (selectedFiles.length > 0) {
        messageData.attachments = selectedFiles;
        messageData.content = messageText.trim() || `Fichier${selectedFiles.length > 1 ? 's' : ''} partagé${selectedFiles.length > 1 ? 's' : ''}`;
      }

      await sendMessage(messageData);
      
      // Réinitialiser après envoi
      setMessageText('');
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      Keyboard.dismiss();
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleFilesSelect = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setShowFilePicker(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
    setShowFilePicker(false);
    if (!showEmojiPicker) {
      Keyboard.dismiss();
    }
  };

  const toggleFilePicker = () => {
    setShowFilePicker(prev => !prev);
    setShowEmojiPicker(false);
    if (!showFilePicker) {
      Keyboard.dismiss();
    }
  };

  const canSend = messageText.trim().length > 0 || selectedFiles.length > 0;

  return (
    <View style={styles.container}>
      {/* Aperçu des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <FilePreview 
          files={selectedFiles} 
          onRemove={removeFile}
        />
      )}

      <View style={styles.inputContainer}>
        {/* Bouton fichiers */}
        <TouchableOpacity 
          style={styles.attachmentButton}
          onPress={toggleFilePicker}
        >
          <Icon 
            name="attach-file" 
            type="material" 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Champ de saisie */}
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Tapez votre message..."
          multiline
          maxLength={1000}
        />

        {/* Bouton emoji */}
        <TouchableOpacity 
          style={styles.emojiButton}
          onPress={toggleEmojiPicker}
        >
          <Icon 
            name={showEmojiPicker ? "keyboard" : "emoji-emotions"} 
            type="material" 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Bouton envoi ou enregistrement vocal */}
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !canSend && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!canSend}
        >
          <Icon 
            name="send" 
            type="material" 
            size={20} 
            color={canSend ? "white" : "#999"} 
          />
        </TouchableOpacity>
      </View>

      {/* Picker d'emojis */}
      <Modal
        visible={showEmojiPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <EmojiPicker 
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Picker de fichiers */}
      <Modal
        visible={showFilePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <FilePicker 
              onFilesSelect={handleFilesSelect}
              onClose={() => setShowFilePicker(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingBottom: 15,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 5,
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});

export default MessageInput;
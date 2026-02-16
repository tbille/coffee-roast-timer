# Voice Input Feature Documentation

## Overview

The voice input feature enables hands-free temperature recording and event tracking for KALDI Wide roasters. This is particularly useful when both hands are busy cranking the roaster.

## Supported Roasters

- **KALDI Wide**: Primary implementation (both hands busy cranking)
- Future: Can be expanded to other manual roasters

## Browser Support

Voice input requires the Web Speech API, which is supported in:
- ✅ Chrome/Chromium (desktop & mobile)
- ✅ Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ❌ Firefox (limited support)

## How to Use

### 1. Starting Voice Input

1. Tap the **"🎤 Voice Input"** button
2. Grant microphone permission when prompted
3. The button will turn red and pulse, indicating it's listening
4. Speak clearly into your device's microphone

### 2. Recording Temperature

Speak the temperature in a natural way:

**Examples:**
- "One hundred ninety two" → Records 192°C
- "Two hundred five" → Records 205°C  
- "One eighty five" → Records 185°C
- "Ninety" → Records 90°C

**Tips:**
- Speak clearly and at normal pace
- You can say numbers in various formats
- The system validates temperatures (0-300°C)
- Temperature is automatically recorded when recognized

### 3. Recording Events

Speak the event name:

**Supported Commands:**
- "First crack" → Records first crack event
- "1st crack" → Records first crack event
- "Second crack" → Records second crack event
- "2nd crack" → Records second crack event

### 4. Stopping Voice Input

The voice input will automatically stop after:
- Successfully recognizing a temperature or command
- 10 seconds of listening (timeout)
- Pressing the "Stop Listening" button

## Visual Feedback

### Listening State
- Button turns **red** and **pulses**
- Shows "Listening..." indicator
- Displays what was heard in real-time

### Recognition Success
- Shows **green checkmark** with recognized temperature
- Shows **blue checkmark** with recognized command
- Auto-stops after 1.5 seconds

### Errors
- Shows error message in red
- Common errors:
  - "No speech detected" - Try speaking louder
  - "Microphone not accessible" - Check browser permissions
  - "Microphone permission denied" - Grant permission in browser settings

## Troubleshooting

### Voice Input Not Working

1. **Check Browser Compatibility**
   - Use Chrome, Edge, or Safari
   - Firefox has limited support

2. **Check Microphone Permissions**
   - Browser should prompt for permission
   - Check browser settings: Site Settings → Microphone
   - Ensure microphone is not blocked

3. **Check Microphone Hardware**
   - Test microphone in other apps
   - Ensure microphone is not muted
   - Check system audio settings

4. **Network Connection**
   - Some browsers require internet connection for speech recognition
   - Recognition happens server-side in some browsers

### Low Recognition Accuracy

1. **Speak Clearly**
   - Use normal speaking pace
   - Avoid background noise
   - Speak directly to microphone

2. **Use Standard Number Format**
   - "One hundred ninety two" works best
   - Avoid shortcuts initially
   - System learns common patterns

3. **Check Microphone Quality**
   - Use device with good microphone
   - Reduce background noise
   - Get closer to microphone

## Technical Details

### Temperature Parsing

The system recognizes:
- Direct numbers: "192", "205"
- Word numbers: "one hundred ninety two"
- Abbreviated: "one eighty five"

Valid range: 0-300°C

### Command Detection

Commands are detected using keyword matching:
- Case-insensitive
- Partial matches allowed ("crack" in "first crack")
- Multiple variations supported

### Auto-Stop Timer

Voice input automatically stops after:
- 10 seconds of listening
- Successful recognition
- Manual stop

This prevents:
- Excessive microphone usage
- Battery drain
- Background noise interference

### Data Recording

Temperatures recorded via voice are marked with:
- `recordMethod: 'voice'`
- Timestamp
- Elapsed time

This allows filtering and analysis of voice-recorded data separately.

## Privacy & Security

- Voice data is processed by browser's speech recognition API
- Some browsers send audio to cloud services (Google, Apple)
- No audio is stored by the app
- Only recognized text is saved
- Microphone access can be revoked at any time

## Future Enhancements

Planned improvements:
- Multi-language support (Spanish, French, German, Japanese)
- Custom command training
- Offline recognition (where supported)
- Voice feedback (text-to-speech confirmation)
- Profile-based voice shortcuts

## API Reference

### useVoiceInput Hook

```typescript
const {
  isListening,      // boolean - Is currently listening
  isSupported,      // boolean - Is Web Speech API supported
  transcript,       // string - Current transcript
  error,           // string | null - Error message
  startListening,  // () => void - Start listening
  stopListening,   // () => void - Stop listening
  resetTranscript  // () => void - Clear transcript
} = useVoiceInput(onResult, onError);
```

### VoiceInput Component

```typescript
<VoiceInput
  onTemperature={(temp: number) => void}
  onCommand={(command: VoiceCommand) => void}
  disabled={boolean}
  className={string}
/>
```

### Voice Commands

```typescript
type VoiceCommand = 
  | 'first-crack'
  | 'second-crack'
  | 'start'
  | 'stop';
```

## Testing

### Manual Testing

1. Open KALDI Wide mode
2. Start roast timer
3. Tap voice input button
4. Speak: "One hundred ninety two"
5. Verify: 192°C is displayed and recorded
6. Speak: "First crack"
7. Verify: First crack event is recorded

### Browser Testing

Test in multiple browsers:
- Chrome (desktop & mobile)
- Safari (desktop & mobile)  
- Edge (desktop)

### Error Handling Testing

Test error scenarios:
- Denied microphone permission
- No speech (silence)
- Invalid temperature values
- Background noise

## Support

For issues or questions:
- Check browser console for error messages
- Verify microphone permissions
- Test in different browser
- Report bugs with browser version and error details

---

**Last Updated:** February 16, 2026  
**Feature Status:** ✅ Implemented (Phase 2B Complete)

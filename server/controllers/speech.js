const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1')
const fs = require('fs')
var speech_to_text = new SpeechToTextV1({
  username: '1234567–8765–4267–9e76-fgff34f',
  password: 'ABCdefghiJK'
});
var files = ['./music/hello.flac'];
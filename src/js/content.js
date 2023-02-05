const state = {
  language: 'ga_CO_pmc_exthts',
  getLanguage: function() {
    return this.language
  },
  setLanguage: function(language) {
    this.language = language
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender) {
    if (!sender) return
    state.setLanguage(request.language)
    console.log(request.language)
    return true
})


console.log('loaded...');

async function generateTextToSpeech(textToGenerateSpeech, language) {
  const sentences = textToGenerateSpeech.split(/\. |\n+/gm)
  console.log(`Sentences: ${sentences.length}`)
  console.log(`Sentences: ${sentences}`)
  for (let i = 0; i < sentences.length;i ++){
    console.log(sentences[i])
    await playAudio(sentences[i], language)
  }
}

async function playAudio(s, l){
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  const context = new (window.AudioContext || window.webkitAudioContext)();
  await fetch(`https://abair.ie/api2/synthesise?input=${s}&voice=${l}&audioEncoding=MP3&timing=WORD`,requestOptions)
  .then(async function (response) {
    return await response.json();
})
.then(async function (json) {
  const audioContent = json.audioContent;
  console.log('result3: ', json)
  const arrayBuffer = await (await fetch(`data:audio/mp3;base64,${audioContent}`)).arrayBuffer();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start();
  await new Promise((resolve) => {
    source.onended = resolve;
  });
});
}

document.addEventListener('mouseup', function translator() {
  let text = ""
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  const translationLangugage = state.getLanguage()
  if (text === '') return
  generateTextToSpeech(text,translationLangugage)
})


export { state }
let returnedSongs = [];

const playButton = document.querySelector("#tunebtn");

const keys = {
  c4: "a",
  "c#4": "s",
  d4: "d",
  "d#4": "f",
  e4: "g",
  f4: "f",
  "f#4": "h",
  g4: "j",
  "g#4": "k",
  a4: "l",
  bb4: "æ",
  b4: "p",
  c5: "q",
  "c#5": "w",
  d5: "e",
  "d#5": "r",
  e5: "t¦",
};

Object.keys(keys).forEach((key) => {
  const element = document.getElementById(key);
  if (element) {
    element.addEventListener("click", function () {
      playTone(key.toUpperCase());
    });
  }
});

document.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  const note = Object.keys(keys).find((note) => keys[note] === key);

  if (note) {
    playTone(note.toUpperCase());
  }
});

function playTone(note) {
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease(note, "8n");
}

const getAllTunes = async () => {
  const url = "http://localhost:3000/api/v1/tunes";

  try {
    const response = await axios.get(url);
    console.log("Success: ", response.data);
    returnedSongs = response.data;

    response.data.forEach((item) => {
      console.log("Tune name: " + item.name);
    });
  } catch (error) {
    console.log(error);
  }
};

const playSelectedTune = () => {
  const selectedTuneName = tunedrop.value;
  console.log(selectedTuneName);

  const tune = returnedSongs.find((song) => song.name == selectedTuneName);
  if (!tune) {
    console.log("Tune not found");
    return;
  }

  tune.tune.forEach((noteObj) => {
    setTimeout(() => playTone(noteObj.note), noteObj.timing * 1000);
  });
};

window.onload = function () {
  getAllTunes();
  playButton.addEventListener("click", playSelectedTune);
};

const tunedrop = document.getElementById("tunesDrop");

document.addEventListener('DOMContentLoaded', function () {
  const recordBtn = document.getElementById('recordbtn');
  const stopBtn = document.getElementById('stopbtn');
  const recordNameInput = document.getElementById('recordName');
  const keys = document.querySelectorAll("#keyboardDiv button");
  const url = "http://localhost:3000/api/v1/tunes"; // Ensure this is defined in the right scope

  let isRecording = false;
  let startTime = 0;
  let recordedTune = [];

  recordBtn.addEventListener('click', function () {
    isRecording = true;
    startTime = Date.now();
    recordedTune = [];
    stopBtn.disabled = false;
    recordBtn.disabled = true;
  });

  stopBtn.addEventListener('click', async function () {
    isRecording = false;
    stopBtn.disabled = true;
    recordBtn.disabled = false;

    const tuneID = Date.now().toString();
    const tuneName = recordNameInput.value.trim() || 'Unnamed Tune';
    const newTune = {
      id: tuneID,
      name: tuneName,
      tune: recordedTune
    };

    // Use axios to post the data
    try {
      const response = await axios.post(url, newTune);
      console.log('Success:', response.data);
      getAllTunes();
      updateTuneDropdown(tuneName);
    } catch (error) {
      console.error('Error posting tune:', error);
    }
  });

  keys.forEach(key => {
    key.addEventListener('click', function () {
      if (isRecording) {
        const now = Date.now();
        const timing = (now - startTime) / 1000;
        recordedTune.push({ note: key.id, duration: "8n", timing: parseFloat(timing.toFixed(2)) });
      }
    });
  });
});

const updateTuneDropdown = (tuneName) => {
  const option = document.createElement("option");
  option.value = tuneName;
  option.text = tuneName;
  tunesDrop.appendChild(option);
};
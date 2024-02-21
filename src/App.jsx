import { useEffect, useState } from 'react';

import './App.css';

const cloud_name = import.meta.env.VITE__CLOUD_NAME;
const upload_preset = import.meta.env.VITE__UPLOAD_PRESET;

const blob = window.URL || window.webkitURL;

function App() {
  const [x, setX] = useState();

  const [audioFile, setAudioFile] = useState('');

  const [audio, setAudio] = useState();

  const [filesList, setFilesList] = useState(
    JSON.parse(localStorage.getItem('audioFiles')) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // let audio = new Audio(audioFile);

  useEffect(() => {
    setAudio(new Audio(audioFile));
  }, []);

  useEffect(() => {
    document.querySelector('#myAudio').addEventListener('ended', function () {
      // audio.currentTime = 0;
      console.log('ended');
      console.log('audio file', audioFile);

      const currentAudioIndex = filesList.findIndex(
        (a) => a.url.toString() == audioFile.toString()
      );
      console.log(currentAudioIndex);
      // setAudio();

      if (currentAudioIndex == filesList.lenght - 1) {
        console.log('im last');
        setAudioFile(filesList[0]);
      } else {
        console.log('not last');
        setAudioFile(filesList[currentAudioIndex + 1]);
      }
    });

    return () =>
      document.querySelector('#myAudio').removeEventListener('ended', () => {});
  }, [audioFile, filesList]);

  const start = () => {
    audio.play();
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    setX(file);
  };

  const uploadAudio = async () => {
    setError(null);
    setLoading(false);

    console.log(x);

    if (!x) return;
    const formData = new FormData();

    formData.append('file', x);
    formData.append('cloud_name', cloud_name);
    formData.append('upload_preset', upload_preset);
    formData.append('resource_type', 'audio');

    setLoading(true);

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dzwub5bux/upload',
        { method: 'post', body: formData }
      );

      if (!response.ok) {
        throw new Error('Something went wrong...');
      }

      const data = await response.json();

      const newAudio = { name: data.original_filename, url: data.url };
      setFilesList((prev) => [...prev, newAudio]);

      localStorage.setItem(
        'audioFiles',
        JSON.stringify(filesList.concat([newAudio]))
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  if (!blob) {
    // console.log('Your browser does not support Blob URLs :(');
    return;
  }

  return (
    <div className="m-2 flex flex-col gap-4 container mx-auto px-12 max-w-2xl text-xl">
      <div className="flex flex-col justify-center">
        <div className="flex mb-4 justify-between items-center py-2 ">
          <input type="file" id="file" onChange={handleChange} />

          <button
            className="border cursor-pointer border-teal-500 bg-teal-500 rounded font-bold p-2"
            disabled={loading}
            onClick={uploadAudio}
          >
            {loading ? 'Uploading... Audio' : 'Upload Audio'}
          </button>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        {audioFile?.name && (
          <p className="p-2 text-center font-semibold mb-1">
            Currently Playing: {audioFile?.name}
          </p>
        )}
        <audio
          className="w-full"
          src={audioFile?.url}
          onClick={start}
          id="myAudio"
          controls
          autoPlay
        ></audio>
      </div>

      <div>
        <h2 className="font-bold text-center text-2xl">Bookmark Playlist</h2>
        <ul className="mt-4  flex flex-col gap-4 cursor-pointer">
          {filesList.map((fileName) => (
            <li
              className="rounded p-2 border m-2 flex items-center justify-between hover:bg-slate-100"
              onClick={() => setAudioFile(fileName)}
              key={fileName.url}
            >
              <span>{fileName.name}</span>
              <span className="text-xl">&#9658;</span>
            </li>
          ))}
        </ul>
        <hr />
      </div>
    </div>
  );
}

export default App;

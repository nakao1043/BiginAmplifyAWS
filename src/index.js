import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation, updateNote as updateNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  function changeNoteName(newNote, newName){
    notes.forEach(note => {
      if(note === newNote){
        note.name = newName;
      } 
    });
    setNotes(notes);
  }

  function changeNoteDescription(newNote, newDsc){
    notes.forEach(note => {
      if(note === newNote){
        note.description = newDsc;
      } 
    });
    setNotes(notes);
  }

  async function updateNote(note) {
    await API.graphql({ query: updateNoteMutation, variables: { input: {id:note.id, name: note.name, description: note.description}  }});
    setNotes(notes);
  }

  async function deleteNote( delNote ) {
    const newNotesArray = notes.filter(note => note.id !== delNote.id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id:delNote.id } }});
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name} style={{marginBottom: 20}}>
              <h2>
                name:&nbsp;
                <input
                  onChange = {e => changeNoteName(note, e.target.value)}
                  defaultValue={note.name}
                />
              </h2>
              <p>
                description:&nbsp;
                <input
                  onChange = {e => changeNoteDescription(note, e.target.value)}
                  defaultValue={note.description}
                />
              </p>
              <button style={{marginRight: 10}} onClick={() => updateNote(note)}>Update note</button>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
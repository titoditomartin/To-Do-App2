import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from "./firebase/firebase";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterDone, setFilterDone] = useState(false);
  const [filterNotDone, setFilterNotDone] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      const todosArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodos(todosArray);
    }, (error) => {
      console.error("Error fetching todos: ", error);
    });
    return () => unsubscribe(); 
  }, []);

  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      await addDoc(collection(db, "todos"), { text: newTodoText, completed: false });
      setNewTodoText("");
      setShowModal(false);
      console.log("Todo added successfully.");
    } catch (error) {
      console.error("Error adding todo: ", error);
    }
  };

  const updateTodo = async (id, updatedTodo) => {
    try {
      const todoRef = doc(db, "todos", id);
      await updateDoc(todoRef, updatedTodo);
      console.log("Todo updated successfully.");
    } catch (error) {
      console.error("Error updating todo: ", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const todoRef = doc(db, "todos", id);
      await deleteDoc(todoRef);
      console.log("Todo deleted successfully.");
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  const toggleFilterDone = () => {
    setFilterDone(!filterDone);
    setFilterNotDone(false);
  };

  const toggleFilterNotDone = () => {
    setFilterNotDone(!filterNotDone);
    setFilterDone(false);
  };

  let filteredTodos = todos;
  if (filterDone) {
    filteredTodos = todos.filter(todo => todo.completed);
  } else if (filterNotDone) {
    filteredTodos = todos.filter(todo => !todo.completed);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <nav className="navbar">
          <div className="profile-info">
            {/* Profile picture and name */}
            <img className="profile-picture" src="path_to_profile_picture" alt="Profile" />
            <span className="profile-name">Tito</span>
            {/* Edit Profile dropdown */}
            <div className="dropdown">
              <button className="dropbtn">Edit Profile</button>
              <div className="dropdown-content">
                <Link to="/profile">Profile</Link>
              </div>
            </div>
          </div>
        </nav>
        <h1 className="header-title">To-Do-App (Febrian Martin - 2602200483)</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>Add Todo</button>
        <button className="filter-button" onClick={toggleFilterDone}>
          {filterDone ? "Show All" : "Show Done"}
        </button>
        <button className="filter-button" onClick={toggleFilterNotDone}>
          {filterNotDone ? "Show All" : "Show Not Done"}
        </button>
      </header>
      
      <main className="app-main">
        <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={() => setShowModal(false)}></div>
        <div className={`modal ${showModal ? 'show' : ''}`}>
          <h2>Add New Todo</h2>
          <input
            className="new-todo-input"
            placeholder="Add a new todo"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
          />
          <div className="modal-actions">
            <button className="add-todo-button" onClick={addTodo}>Add</button>
            <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>

        <div className="todo-list">
          {filteredTodos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
              />
              <span className="todo-text">{todo.text}</span>
              <button className="delete-todo-button" onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;

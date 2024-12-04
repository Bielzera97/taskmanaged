"use client";
import { db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

type Task = {
  id: string;
  title: string;
  text: string;
  date: string;
};

export default function Home() {
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTextId, setEditTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("")

  // Função para criar nova task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        text,
        date: new Date().toISOString(), // Salvar data como string ISO
      });
      setTitle("");
      setText("");
    } catch (error) {
      console.error("Erro ao criar task:", error);
    }
  };

  const handleDelete = async (taskId : string) => {
    try{
      const taskRef = doc(db, "tasks", taskId);
      await deleteDoc(taskRef)
      
    }catch(error){
      console.log(error)
    } 
  }

  const handleEdit = (task : Task) => {
    setEditTextId(task.id);
    setEditText(task.text);
  }



  const handleSaveEdit = async (taskId : string, newText : string) => {
    try{
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, {text : newText})
      setEditTextId(null)
    }
    catch(error) {
      console.log(error)
    }
  }
  // useEffect para buscar tasks em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      setTasks(tasksList);
    });

    // Limpar listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  return (
    <main>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Texto"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Criar</button>
      </form>
      <section>
        <h1>Tasks</h1>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {editTextId === task.id ? (
                  <>
                  <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <button onClick={() => handleSaveEdit(editTextId!, editText)}>salvar</button>
                  <button onClick={() => setEditTextId(null)}>Cancelar</button>
                  </>
                ) : <>

<h2>{task.title}</h2>
                <p>{task.text}</p>
                <small>
                  {new Date(task.date).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </small>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => handleDelete(task.id)}>Delete</button>
                
                    </>}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma task encontrada.</p>
        )}
      </section>
    </main>
  );
}

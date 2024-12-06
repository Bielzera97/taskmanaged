"use client";
import { Button } from "@/components/ui/button";
import {format} from "date-fns"
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Loader2, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card} from "@/components/ui/card";
 


type Task = {
  id: string;
  title: string;
  text: string;
  taskDate: string;
  time: string
};

export default function Home() {
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date())
  const [editTextId, setEditTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("")
  const [time, setTime] = useState("")

  // Função para criar nova task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        text,
        taskDate : taskDate?.toISOString(), // Salvar data como string ISO
        time
      });
      setTitle("");
      setText("");
      setTaskDate(new Date())
      setTime("")
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

  console.log(time)

  return (
    <main className="flex">
        <form onSubmit={handleCreate}>
                <Input
                  type="text"
                  placeholder="Título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Texto"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                >
                  <CalendarIcon />
                  {taskDate ? format(taskDate , "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={taskDate}
                  onSelect={setTaskDate}
                  
                />
              </PopoverContent>
            </Popover>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}/>
                <Button type="submit" variant="outline">Criar</Button>
        </form>
      <Card> 
        <h1 className="principal">Tarefas</h1>
        {tasks === null ? <Loader2 className="animate-spin"/> : 
                <section >
                {tasks.length > 0 ? (
                  <ul>
                    {tasks.map((task) => (
                      <li key={task.id}>
                        {editTextId === task.id ? (
                          <>
                          <Input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} />
                          <Button onClick={() => handleSaveEdit(editTextId!, editText)}>Salvar</Button>
                          <Button onClick={() => setEditTextId(null)}>Cancelar</Button>
                          </>
                        ) : 
                        <Card className="flex flex-col gap-2">
                         <section className="flex flex-row items-baseline justify-between gap-5">
                            <h1 className="principal text-xl">
                              {new Date(task.taskDate).toLocaleString("pt-BR", {
                                dateStyle: "short"
                              })}
                            </h1>
                            <h2 className="text-2xl">{task.time}</h2>
                          </section> 
                        <h2 className="principal text-[var(--font-title)] text-xl">{task.title}</h2>
                        <p className="secondary text-[var(--font-principal)] ">{task.text}</p>
                        <section>
                          <Button variant="secondary" className="orange-button" onClick={() => handleEdit(task)}>Editar tarefa</Button>
                          <Button variant="destructive" className="red-button" onClick={() => handleDelete(task.id)}>Deletar tarefa</Button>
                        </section>
                        </Card>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma task encontrada.</p>
                )}
              </section>
        }
      </Card>   
    </main>
  );
}

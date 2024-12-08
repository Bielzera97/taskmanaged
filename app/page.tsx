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
  taskDate: Date;
  time: string
};

export default function Home() {
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date())
  const [editTextId, setEditTextId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("")
  const [editTitle, setEditTitle] = useState<string>("")
  const [editTaskDate, setEditTaskDate] = useState<Date | undefined>(new Date())
  const [editTime, setEditTime] = useState<string>("")
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
    setEditTaskDate(new Date(task.taskDate));
    setEditTime(task.time)
    setEditTitle(task.title)
  }



  const handleSaveEdit = async (taskId : string, newText : string, newTaskDate: Date | undefined, newTime: string, newTitle : string) => {
    try{
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, {
        text : newText,
        taskDate : newTaskDate?.toISOString(),
        time: newTime,
        title: newTitle
      })
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
      <Card className="w-full h-screen m-5"> 
        <h1 className="principal">Tarefas</h1>
        {tasks === null ? <section className="flex items-center text-3xl"><Loader2 className="animate-spin "/></section> : 
                <section >
                {tasks.length > 0 ? (
                  <ul>
                    {tasks.map((task) => (
                      <li key={task.id}>
                        {editTextId === task.id ? (
                          <Card className="flex flex-col gap-2 max-w-[300px] px-5">
                            <Input
                              type="text"
                              placeholder="Título"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          <Input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} />
                          <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)}/>
                          <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                >
                                  <CalendarIcon />
                                  {editTaskDate ? format(editTaskDate , "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editTaskDate}
                                  onSelect={setEditTaskDate}
                                  
                                />
                              </PopoverContent>
                          </Popover>
                          <section className="flex justify-center">
                            <Button className="green-button hover:bg-[var(--green-medium)]" onClick={() => handleSaveEdit(editTextId!, editText, editTaskDate, editTime, editTitle)}>Salvar</Button>
                            <Button className="red-button hover:bg-[var(--red-medium)]" onClick={() => setEditTextId(null)}>Cancelar</Button>
                          </section>
                          </Card>
                        ) : 
                        <Card className="flex flex-col gap-2 max-w-[300px] px-5">
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
                            <section className="flex items-center justify-center">
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

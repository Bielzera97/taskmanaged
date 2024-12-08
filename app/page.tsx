"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import {
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  text: string;
  taskDate: string;
  time: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[] | null>(null);

  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editTaskDate, setEditTaskDate] = useState<Date | undefined>(
    new Date()
  );

  // Função para criar uma nova tarefa
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !text || !taskDate || !time) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "tasks"), {
        title,
        text,
        taskDate: taskDate.toISOString(),
        time,
      });

      setTitle("");
      setText("");
      setTaskDate(new Date());
      setTime("");
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  // Função para deletar tarefa
  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  // Função para editar tarefa
  const handleEdit = (task: Task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditText(task.text);
    setEditTime(task.time);
    setEditTaskDate(new Date(task.taskDate));
  };

  const handleSaveEdit = async () => {
    if (!editTitle || !editText || !editTaskDate || !editTime || !editTaskId) {
      alert("Preencha todos os campos antes de salvar.");
      return;
    }

    try {
      await updateDoc(doc(db, "tasks", editTaskId), {
        title: editTitle,
        text: editText,
        taskDate: editTaskDate.toISOString(),
        time: editTime,
      });

      setEditTaskId(null);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      setTasks(taskList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="grid grid-cols-3 gap-5 p-5 h-screen w-screen overflow-hidden">
      {/* Formulário para criar tarefas */}
      <Card className="col-span-1 flex flex-col items-center gap-4 p-5 card ">
        <h1 className="text-lg font-bold">Anote sua tarefa</h1>
        <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
          <Input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Texto"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2" />
                {taskDate ? format(taskDate, "PPP") : "Escolha uma data"}
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
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex items-center justify-center"
          />
          <Button type="submit" variant="default">
            Criar Tarefa
          </Button>
        </form>
      </Card>

      {/* Lista de tarefas */}
      <section className="col-span-2 space-y-4 max-w-screen max-h-screen ">
        {tasks === null ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : tasks.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4">
            {tasks.map((task) => (
              <li key={task.id}>
                {editTaskId === task.id ? (
                  <Card className="p-4 space-y-3 card">
                    <Input
                      placeholder="Título"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Texto"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="mr-2" />
                          {editTaskDate
                            ? format(editTaskDate, "PPP")
                            : "Escolha uma data"}
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
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="flex items-center justify-center"
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="default" onClick={handleSaveEdit}>
                        Salvar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setEditTaskId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 space-y-3 card">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold">{task.title}</h2>
                      <p className="text-xl time">{task.time}</p>
                    </div>
                    <p>{task.text}</p>
                    <p className="text-sm time">
                      <span className="text-black">Data : </span>{new Date(task.taskDate).toLocaleDateString()}
                    </p>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(task)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </Card>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma tarefa encontrada.</p>
        )}
      </section>
    </main>
  );
}

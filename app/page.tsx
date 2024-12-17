"use client";

import { useState, useEffect, useMemo } from "react";
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
import { LoaderCircle, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Para o sistema de completa

type Task = {
  id: string;
  title: string;
  text: string;
  taskDate: string;
  time: string;
  completed: boolean;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  // Criar nova tarefa
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
        completed: false,
      });

      setTitle("");
      setText("");
      setTaskDate(new Date());
      setTime("");
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  // Alternar status de completa/pendente
  const toggleCompleted = async (taskId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { completed: !completed });
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  // Deletar tarefa
  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  // Carregar tarefas
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

  // Filtrar tarefas com useMemo
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    switch (filter) {
      case "completed":
        return tasks.filter((task) => task.completed);
      case "pending":
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <main className="grid grid-cols-3 gap-5 p-5 h-screen w-screen overflow-hidden">
      {/* Formulário */}
      <Card className="col-span-1 flex flex-col items-center gap-4 p-5">
        <h1 className="text-lg font-bold">Anote sua tarefa</h1>
        <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Texto" value={text} onChange={(e) => setText(e.target.value)} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2" />
                {taskDate ? format(taskDate, "PPP") : "Escolha uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={taskDate} onSelect={setTaskDate} />
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
      <section className="col-span-2 space-y-4 max-w-screen max-h-screen">
        {/* Filtros */}
        <div className="flex gap-4 justify-center mb-4">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            Todas
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </Button>
        </div>

        {tasks === null ? (
          <div className="flex items-center justify-center pt-20">
            <LoaderCircle size="80px" strokeWidth="1.25px" className="animate-spin" />
          </div>
        ) : filteredTasks.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <Card className="p-4 space-y-3 card">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleCompleted(task.id, task.completed)}
                      />
                      <h2 className={`text-lg font-bold ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </h2>
                    </div>
                    <p className="text-xl">{task.time}</p>
                  </div>
                  <p>{task.text}</p>
                  <p className="text-sm">
                    <span className="text-black">Data: </span>
                    {new Date(task.taskDate).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button variant="destructive" onClick={() => handleDelete(task.id)}>
                      Deletar
                    </Button>
                  </div>
                </Card>
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
  
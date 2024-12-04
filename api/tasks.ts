import { db } from "@/lib/firebase";

import { collection, addDoc, getDocs } from "firebase/firestore";
import { NextApiRequest,NextApiResponse } from "next";


interface Task {
    title: string,
    text: string,
    date: string,
}

const handler = async (req : NextApiRequest, res : NextApiResponse) => {

    if(req.method === "POST"){
        const {title, text, date} : Task = req.body

        try{
            const docRef = await addDoc(collection(db, "tasks"), {
                title,
                text,
                date
            })
            res.status(201).json({if: docRef.id})
        }catch(error){
            console.log(error)
        }
        }else if(req.method === "GET"){
            try{
                const snapshot = await getDocs(collection(db, "tasks"))
                const tasks = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                res.status(200).json(tasks)
            }catch(error) {
                console.log(error)
            }


    }else{
        res.setHeader("Allow", ["POST", "GET"])
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}


export default handler
// //src/components/admin/QuestionModal.jsx
// import { useEffect, useState } from "react"

// import Button from "../ui/Button"
// import Input from "../ui/Input"
// // import Textarea from "../ui/Textarea"
// // import Select from "../ui/Select"

// import { Trash2, Check, X } from "lucide-react";

// export default function QuestionModal({
//   open,
//   onClose,
//   onSaved,
//   question,
//   JAVA_API,
//   token
// }){

//   const isEdit = !!question

//   const [form,setForm] = useState({
//     type:"video",
//     text:"",
//     topic:"",
//     hint:"",
//     mediaUrl:"",
//     options:["","","",""],
//     correctIndex:0
//   })

//   useEffect(()=>{

//     if(question){
//       setForm({
//         type:question.type,
//         text:question.text,
//         topic:question.topic,
//         hint:question.hint,
//         mediaUrl:question.media,
//         options:question.options,
//         correctIndex:question.correct
//       })
//     }

//   },[question])

//   if(!open) return null

//   function updateField(name,value){
//     setForm(prev=>({...prev,[name]:value}))
//   }

//   function updateOption(index,value){

//     const newOptions=[...form.options]
//     newOptions[index]=value

//     setForm(prev=>({...prev,options:newOptions}))
//   }

//   function addOption(){
//     setForm(prev=>({
//       ...prev,
//       options:[...prev.options,""]
//     }))
//   }

//   function removeOption(index){

//     const newOptions=form.options.filter((_,i)=>i!==index)

//     setForm(prev=>({
//       ...prev,
//       options:newOptions,
//       correctIndex:0
//     }))
//   }

//   async function saveQuestion(){

//     const payload={
//       type:form.type,
//       text:form.text,
//       topic:form.topic,
//       hint:form.hint,
//       mediaUrl:form.mediaUrl,
//       options:form.options,
//       correctIndex:Number(form.correctIndex)
//     }

//     try{

//       const url = isEdit
//         ? `${JAVA_API}/questions/${question.id}`
//         : `${JAVA_API}/questions`

//       const method = isEdit ? "PUT" : "POST"

//       const res = await fetch(url,{
//         method,
//         headers:{
//           "Content-Type":"application/json",
//           Authorization:`Bearer ${token}`
//         },
//         body:JSON.stringify(payload)
//       })

//       if(!res.ok){
//         alert("Error saving question")
//         return
//       }

//       onSaved()
//       onClose()

//     }catch(err){
//       console.error(err)
//       alert("Request failed")
//     }

//   }

//   async function deleteQuestion(){

//     if(!window.confirm("Delete this question?")) return

//     try{

//       const res = await fetch(`${JAVA_API}/questions/${question.id}`,{
//         method:"DELETE",
//         headers:{
//           Authorization:`Bearer ${token}`
//         }
//       })

//       if(!res.ok){
//         alert("Delete failed")
//         return
//       }

//       onSaved()
//       onClose()

//     }catch(err){
//       console.error(err)
//     }

//   }

//   return(

//   <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

//     <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[720px] max-h-[90vh] overflow-auto">

//       <h2 className="text-lg font-semibold mb-6">
//         {isEdit ? "Edit Question" : "New Question"}
//       </h2>

//       {/* BASIC FIELDS */}

//       <div className="grid gap-4">

//         <select
//           value={form.type}
//           onChange={e=>updateField("type",e.target.value)}
//         >
//           <option value="video">Video</option>
//           <option value="image">Image</option>
//           <option value="text">Text</option>
//         </select>

//         <input
//           placeholder="Topic"
//           value={form.topic}
//           onChange={e=>updateField("topic",e.target.value)}
//         />

//         <textarea
//           placeholder="Question text"
//           value={form.text}
//           onChange={e=>updateField("text",e.target.value)}
//         />

//         <textarea
//           placeholder="Hint"
//           value={form.hint}
//           onChange={e=>updateField("hint",e.target.value)}
//         />

//         <input
//           placeholder="Media URL"
//           value={form.mediaUrl}
//           onChange={e=>updateField("mediaUrl",e.target.value)}
//         />

//       </div>

//       {/* OPTIONS */}

//       <div className="mt-8">

//         <div className="flex justify-between items-center mb-3">

//           <h3 className="font-semibold text-sm">
//             Options
//           </h3>

//           <Button
//             variant="primary"
//             onClick={addOption}
//           >
//             Add Option
//           </Button>

//         </div>

//         {form.options.map((opt,i)=>{

//           const isCorrect = form.correctIndex===i

//           return(

//           <div
//             key={i}
//             className={`flex items-center gap-3 mb-2 p-2 rounded border
//               ${isCorrect
//                 ? "border-green-500 bg-green-500/10"
//                 : "border-red-500/30"
//               }`}
//           >

//             <input
//               value={opt}
//               onChange={e=>updateOption(i,e.target.value)}
//               className="flex-1"
//             />

//             {/* CORRECT SELECTOR */}

//             <button
//               onClick={()=>updateField("correctIndex",i)}
//               className={`flex items-center justify-center w-8 h-8 rounded border
//                 ${isCorrect
//                   ? "border-green-500 text-green-400"
//                   : "border-red-500 text-red-400"
//                 }`}
//             >
//               {isCorrect
//                 ? <Check size={16}/>
//                 : <X size={16}/>
//               }
//             </button>

//             {/* DELETE OPTION */}

//             <Button
//               variant="danger"
//               onClick={()=>removeOption(i)}
//               className="px-2"
//             >
//               <Trash2 size={16}/>
//             </Button>

//           </div>

//           )

//         })}

//       </div>

//       {/* FOOTER */}

//       <div className="flex justify-between mt-8">

//         <div>

//           {isEdit && (

//             <Button
//               variant="danger"
//               onClick={deleteQuestion}
//             >
//               Delete
//             </Button>

//           )}

//         </div>

//         <div className="flex gap-2">

//           <Button
//             variant="secondary"
//             onClick={onClose}
//           >
//             Cancel
//           </Button>

//           <Button
//             variant="primary"
//             onClick={saveQuestion}
//           >
//             Save
//           </Button>

//         </div>

//       </div>

//     </div>

//   </div>

//   )
// }


//src/components/admin/QuestionModal.jsx
import { useEffect, useState } from "react"

import Button from "../ui/Button"
import Input from "../ui/Input"

import { Trash2, Check, X } from "lucide-react";

export default function QuestionModal({
  open,
  onClose,
  onSaved,
  question,
  JAVA_API,
  token
}){

  const isEdit = !!question

  const [form,setForm] = useState({
    type:"video",
    text:"",
    topic:"",
    hint:"",
    mediaUrl:"",
    options:["","","",""],
    correctIndex:0
  })

  useEffect(()=>{

    if(question){
      setForm({
        type:question.type,
        text:question.text,
        topic:question.topic,
        hint:question.hint,
        mediaUrl:question.media,
        options:question.options,
        correctIndex:question.correct
      })
    }

  },[question])

  if(!open) return null

  function updateField(name,value){
    setForm(prev=>({...prev,[name]:value}))
  }

  function updateOption(index,value){

    const newOptions=[...form.options]
    newOptions[index]=value

    setForm(prev=>({...prev,options:newOptions}))
  }

  function addOption(){
    setForm(prev=>({
      ...prev,
      options:[...prev.options,""]
    }))
  }

  function removeOption(index){

    const newOptions=form.options.filter((_,i)=>i!==index)

    setForm(prev=>({
      ...prev,
      options:newOptions,
      correctIndex:0
    }))
  }

  async function saveQuestion(){

    const payload={
      type:form.type,
      text:form.text,
      topic:form.topic,
      hint:form.hint,
      mediaUrl:form.mediaUrl,
      options:form.options,
      correctIndex:Number(form.correctIndex)
    }

    try{

      const url = isEdit
        ? `${JAVA_API}/questions/${question.id}`
        : `${JAVA_API}/questions`

      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url,{
        method,
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify(payload)
      })

      if(!res.ok){
        alert("Error saving question")
        return
      }

      onSaved()
      onClose()

    }catch(err){
      console.error(err)
      alert("Request failed")
    }

  }

  async function deleteQuestion(){

    if(!window.confirm("Delete this question?")) return

    try{

      const res = await fetch(`${JAVA_API}/questions/${question.id}`,{
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      if(!res.ok){
        alert("Delete failed")
        return
      }

      onSaved()
      onClose()

    }catch(err){
      console.error(err)
    }

  }

  return(

  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="
      bg-white dark:bg-slate-900
      border border-gray-300 dark:border-slate-700
      text-gray-900 dark:text-slate-100
      rounded-xl p-6 w-[720px] max-h-[90vh] overflow-auto
    ">

      <h2 className="text-lg font-semibold mb-6">
        {isEdit ? "Edit Question" : "New Question"}
      </h2>

      {/* BASIC FIELDS */}

      <div className="grid gap-4">

        <select
          value={form.type}
          onChange={e=>updateField("type",e.target.value)}
          className="
            w-full p-2 rounded border
            bg-white dark:bg-slate-800
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-slate-100
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
          "
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
        </select>

        <input
          placeholder="Topic"
          value={form.topic}
          onChange={e=>updateField("topic",e.target.value)}
          className="
            w-full p-2 rounded border
            bg-white dark:bg-slate-800
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
          "
        />

        <textarea
          placeholder="Question text"
          value={form.text}
          onChange={e=>updateField("text",e.target.value)}
          className="
            w-full p-2 rounded border min-h-[80px]
            bg-white dark:bg-slate-800
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
          "
        />

        <textarea
          placeholder="Hint"
          value={form.hint}
          onChange={e=>updateField("hint",e.target.value)}
          className="
            w-full p-2 rounded border min-h-[70px]
            bg-white dark:bg-slate-800
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
          "
        />

        <input
          placeholder="Media URL"
          value={form.mediaUrl}
          onChange={e=>updateField("mediaUrl",e.target.value)}
          className="
            w-full p-2 rounded border
            bg-white dark:bg-slate-800
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
          "
        />

      </div>

      {/* OPTIONS */}

      <div className="mt-8">

        <div className="flex justify-between items-center mb-3">

          <h3 className="font-semibold text-sm">
            Options
          </h3>

          <Button
            variant="primary"
            onClick={addOption}
          >
            Add Option
          </Button>

        </div>

        {form.options.map((opt,i)=>{

          const isCorrect = form.correctIndex===i

          return(

          <div
            key={i}
            className={`flex items-center gap-3 mb-2 p-2 rounded border
              ${isCorrect
                ? "border-green-500 bg-green-500/10"
                : "border-red-500/30"
              }`}
          >

            <input
              value={opt}
              onChange={e=>updateOption(i,e.target.value)}
              className="
                flex-1 p-2 rounded border
                bg-white dark:bg-slate-800
                border-gray-300 dark:border-slate-700
                text-gray-900 dark:text-slate-100
                placeholder-gray-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
            />

            <button
              onClick={()=>updateField("correctIndex",i)}
              className={`flex items-center justify-center w-8 h-8 rounded border
                ${isCorrect
                  ? "border-green-500 text-green-400"
                  : "border-red-500 text-red-400"
                }`}
            >
              {isCorrect
                ? <Check size={16}/>
                : <X size={16}/>
              }
            </button>

            <Button
              variant="danger"
              onClick={()=>removeOption(i)}
              className="px-2"
            >
              <Trash2 size={16}/>
            </Button>

          </div>

          )

        })}

      </div>

      {/* FOOTER */}

      <div className="flex justify-between mt-8">

        <div>

          {isEdit && (

            <Button
              variant="danger"
              onClick={deleteQuestion}
            >
              Delete
            </Button>

          )}

        </div>

        <div className="flex gap-2">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={saveQuestion}
          >
            Save
          </Button>

        </div>

      </div>

    </div>

  </div>

  )
}
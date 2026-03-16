
import React, {useState,useEffect} from "react"

const W=10
const H=20

const shapes=[
[[1,1,1,1]],
[[1,1],[1,1]],
[[0,1,0],[1,1,1]]
]

function empty(){
return Array.from({length:H},()=>Array(W).fill(0))
}

export default function App(){

const [board,setBoard]=useState(empty())
const [piece,setPiece]=useState({shape:shapes[0],x:3,y:0})
const [score,setScore]=useState(0)
const [msg,setMsg]=useState("")

const messages=[
"Tamay harikasın!",
"Tamay ışık saçıyor!",
"Devam et Tamay!",
"Tamay bugün yıldız!"
]

function collide(b,p,dx,dy){
for(let y=0;y<p.shape.length;y++){
for(let x=0;x<p.shape[y].length;x++){
if(p.shape[y][x]){
let nx=p.x+x+dx
let ny=p.y+y+dy
if(nx<0||nx>=W||ny>=H) return true
if(ny>=0&&b[ny][nx]) return true
}
}
}
return false
}

function merge(b,p){
let nb=b.map(r=>[...r])
p.shape.forEach((row,y)=>{
row.forEach((v,x)=>{
if(v && p.y+y>=0) nb[p.y+y][p.x+x]=1
})
})
return nb
}

function clear(b){
let lines=0
let nb=b.filter(r=>{
if(r.every(c=>c)){lines++;return false}
return true
})
while(nb.length<H) nb.unshift(Array(W).fill(0))
return {nb,lines}
}

function tick(){
setPiece(p=>{
if(!collide(board,p,0,1)) return {...p,y:p.y+1}
let merged=merge(board,p)
let {nb,lines}=clear(merged)
if(lines){
setScore(s=>s+lines*100)
setMsg(messages[Math.floor(Math.random()*messages.length)])
setTimeout(()=>setMsg(""),2000)
}
setBoard(nb)
return {shape:shapes[Math.floor(Math.random()*shapes.length)],x:3,y:0}
})
}

useEffect(()=>{
let t=setInterval(tick,700)
return ()=>clearInterval(t)
})

function move(d){
setPiece(p=>!collide(board,p,d,0)?{...p,x:p.x+d}:p)
}

return(
<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20}}>

<h1>Tamyris Tetris</h1>

<div style={{display:"grid",gridTemplateColumns:`repeat(${W},24px)`}}>
{board.map((row,y)=>
row.map((c,x)=>
<div key={y+"-"+x} style={{
width:24,height:24,
border:"1px solid #111",
background:c?"#22d3ee":"#020617"
}}/>
)
)}
</div>

<div style={{marginTop:20}}>
<button onClick={()=>move(-1)}>◀</button>
<button onClick={()=>move(1)}>▶</button>
</div>

<p>Score: {score}</p>
<p>{msg}</p>

<footer style={{marginTop:30,opacity:.7}}>CaĞnım Kızıma :)</footer>

</div>
)
}

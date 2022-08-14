const ele=document.querySelector('#tip')
const btn=document.querySelector('#hidebtn')
alert('working')
btn.addEventListener('click',()=>{
    ele.style.display='inline'
    alert('Worked')
})
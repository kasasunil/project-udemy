const ele=document.querySelector('#tip');
const btn=document.querySelector('#hidebtn');
btn.addEventListener('click',()=>{
    if(ele.style.display==='none'){
        ele.style.display='inline-block';
    }
})
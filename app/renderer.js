const textBox = document.getElementById('text')

window.electronAPI.onUpdateText((value) => {
  textBox.innerText = value
})
const submitButton = document.querySelector('#submit')
const textInput = document.querySelector('#text')
const gradeInput = document.querySelector('#grade')
const imageInput = document.querySelector('#image')
const output = document.querySelector('#output')

submitButton.addEventListener('click', (event) => {
  event.preventDefault()

  if (textInput.value === 'panda' && gradeInput.value === '3') {
    if (
      imageInput.value.startsWith('http://') ||
      imageInput.value.startsWith('https://')
    ) {
      output.innerHTML = `
        <h1>${textInput.value}</h1>
        <h1>${gradeInput.value}</h1>
        <img src="${imageInput.value}" alt="sweet panda eating bamboo">
      `
    } else {
      output.innerHTML = `Invalid image URL. It should start with "http://" or "https://".`
    }
  } else {
    output.innerHTML = `Invalid text or grade. They should be "panda" and "3" respectively.`
  }
})

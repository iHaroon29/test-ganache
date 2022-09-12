document.addEventListener('DOMContentLoaded', async () => {
  let flag = true
  const getVotingButton = document.querySelector('.special-btn')
  const slider = document.querySelector('.slider')
  getVotingButton.addEventListener('click', (e) => {
    if (!flag) {
      slider.classList.remove('slider-active')
      flag = true
    } else {
      slider.classList.add('slider-active')
      flag = false
    }
  })
})

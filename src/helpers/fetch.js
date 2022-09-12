const fetchData = async (argv) => {
  const { url, options } = argv
  const res = await fetch(url, options)
  return await res.json()
}
export default fetchData

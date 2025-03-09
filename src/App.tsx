import useBearStore from "./store/useBearStore";


export default function App() {
  const {bears, increase, decrease, reset} = useBearStore()
  return (
    <div className="container">
      <span>bears: {bears}</span>
      <button onClick={() => increase(1)}>one up</button>
      <button onClick={() => decrease(1)}>one down</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}
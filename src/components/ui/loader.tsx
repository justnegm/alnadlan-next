import { Spinner } from './spinner'

const Loader = () => {
  return (
     <div
        style={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100dvh",
            backgroundColor: "#fff",
        }}
    >
       <Spinner className="size-8" />
    </div>
  )
}

export default Loader
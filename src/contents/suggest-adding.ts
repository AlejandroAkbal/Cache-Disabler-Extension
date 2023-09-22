import type { PlasmoCSConfig } from "plasmo"





export const config: PlasmoCSConfig = {
  matches: ["http://localhost:*/*", "http://localhost/*"]
}

window.addEventListener("load", () => {
  console.log("You should see this message on localhost")
})
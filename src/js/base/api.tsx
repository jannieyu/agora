import { stringify } from "qs"

export default function buildWrappedGet<Args, OnLoad, OnError>(url: string) {
  return (args: Args, onLoad: OnLoad, onError: OnError) => {
    const serializedArgs = stringify(args)
    const location = `${url}?${serializedArgs}`

    const headers = new Headers({
      "Content-Type": "text/json",
    })

    return fetch(location, {
      method: "GET",
      headers,
    })
      .then((res) => {
        if (!res.ok) throw res
        return res.json()
      })
      .then(onLoad)
      .catch((err) => {
        err
          .json()
          .then((body) => {
            onError({ body, status: err.status, statusText: err.statusText })
          })
          .catch(() => onError({ body: null, status: err.status, statusText: err.statusText }))
      })
  }
}

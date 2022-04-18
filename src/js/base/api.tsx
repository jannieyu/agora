interface APIError {
  body: unknown
  status: number
  statusText: string
}

type OnError = (err: APIError) => unknown

export default function buildWrappedGet<Args, Response extends unknown>(url: string) {
  return (args: Args, onLoad: (response: Response) => unknown, onError: OnError) => {
    const serializedArgs = JSON.stringify(args)
    const location = `${url}?data=${serializedArgs}`

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
          .text()
          .then((body) => {
            onError({ body, status: err.status, statusText: err.statusText })
          })
          .catch(() => onError({ body: null, status: err.status, statusText: err.statusText }))
      })
  }
}

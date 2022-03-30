package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
		urlParams := r.URL.Query()["data"]

		fmt.Println(urlParams)

		fmt.Fprintf(w, "You've made the following query %s\n", urlParams[0])
	})

	port := 8000
	fmt.Println("Server up and running on port " + fmt.Sprint(port))
	http.ListenAndServe(":"+fmt.Sprint(port), r)
}

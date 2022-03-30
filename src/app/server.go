package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID        uint32
	FirstName string
	LastName  string
	Email     string
	Pword     string
}

func main() {

	dsn := "host=localhost user=postgres password=postgres dbname=web port=5432 sslmode=disable TimeZone=US/Pacific"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("failed to connect to database")
	}

	var users []User
	db.Model(&User{}).Select("*").Scan(&users)

	for _, user := range users {
		fmt.Println("User", user.FirstName, user.LastName, "has registered with email", user.Email)
	}

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

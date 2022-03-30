package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	// key must be 16, 24 or 32 bytes long (AES-128, AES-192 or AES-256)
	// Should be something like:
	// var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
	key   = []byte("super-secret-key")
	store = sessions.NewCookieStore(key)
)

type User struct {
	ID        uint32
	FirstName string
	LastName  string
	Email     string
	Pword     string
}

func login(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie-name")
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode, MaxAge: 0}

	// Authentication goes here
	// ...

	// Set user as authenticated
	session.Values["authenticated"] = true
	session.Save(r, w)

	fmt.Println("Authenticated!")
	fmt.Fprintf(w, "{}")
}

func logout(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie-name")

	// Revoke users authentication
	session.Values["authenticated"] = false
	session.Save(r, w)
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

	r.HandleFunc("/api/example", func(w http.ResponseWriter, r *http.Request) {

		session, _ := store.Get(r, "cookie-name")

		// Check if user is authenticated
		if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		} else {
			urlParams := r.URL.Query()["data"]
			fmt.Println(urlParams)
			fmt.Fprintf(w, urlParams[0])
		}
	})

	r.HandleFunc("/api/login", login)
	r.HandleFunc("/api/logout", logout)

	port := 8000
	fmt.Println("Server up and running on port " + fmt.Sprint(port))
	http.ListenAndServe(":"+fmt.Sprint(port), r)
}

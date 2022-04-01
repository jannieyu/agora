package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	// key must be 16, 24 or 32 bytes long (AES-128, AES-192 or AES-256)
	// Should be something like:
	// var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
	key    = []byte("super-secret-key")
	store  = sessions.NewCookieStore(key)
	db     *gorm.DB
	db_err error
)

type User struct {
	ID        uint32
	FirstName string
	LastName  string
	Email     string
	Pword     string
}

type LoginCredentials struct {
	Email    string
	Password string
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func login(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie-name")
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	urlParams := r.URL.Query()["data"][0]
	var loginCredentials LoginCredentials

	err := json.Unmarshal([]byte(urlParams), &loginCredentials)

	if err != nil {
		w.WriteHeader(400)
		fmt.Fprint(w, "{}")
	}

	var user User
	db.Where("email = ?", loginCredentials.Email).First(&user)
	fmt.Println("User", user.FirstName, user.LastName, "has registered with email", user.Email)

	var status = map[string]string{
		"email":     "",
		"firstName": "",
		"lastName":  "",
	}

	if user.ID > 0 && CheckPasswordHash(loginCredentials.Password, user.Pword) {
		// Authentication was successful!
		session.Values["authenticated"] = true
		session.Values["user_email"] = loginCredentials.Email
		session.Values["first_name"] = user.FirstName
		session.Values["last_name"] = user.LastName
		session.Save(r, w)

		status["email"] = user.Email
		status["firstName"] = user.FirstName
		status["lastName"] = user.LastName

		fmt.Println("Authenticated!")

	} else {
		w.WriteHeader(401)
		fmt.Fprint(w, "{}")
	}

	jsonString, _ := json.Marshal(status)
	fmt.Fprint(w, string(jsonString))
}

func logout(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie-name")
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	// Revoke users authentication
	session.Values["authenticated"] = false
	session.Values["user_email"] = ""
	session.Values["first_name"] = ""
	session.Values["last_name"] = ""
	session.Save(r, w)

	fmt.Println(session.Values)

	fmt.Fprint(w, "{}")
}

func getLoginStatus(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "cookie-name")

	fmt.Println(session.Values)

	var status = map[string]string{
		"email":     "",
		"firstName": "",
		"lastName":  "",
	}

	if authenticated, ok := session.Values["authenticated"]; ok && authenticated.(bool) {
		fmt.Println("User is authenticated")
		status["email"] = session.Values["user_email"].(string)
		status["firstName"] = session.Values["first_name"].(string)
		status["lastName"] = session.Values["last_name"].(string)
	}

	jsonString, _ := json.Marshal(status)
	fmt.Fprint(w, string(jsonString))
}

func main() {

	dsn := "host=localhost user=postgres password=postgres dbname=web port=5432 sslmode=disable TimeZone=US/Pacific"
	db, db_err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if db_err != nil {
		panic("failed to connect to database")
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
	r.HandleFunc("/api/get_login_status", getLoginStatus)

	port := 8000
	fmt.Println("Server up and running on port " + fmt.Sprint(port))
	http.ListenAndServe(":"+fmt.Sprint(port), r)
}

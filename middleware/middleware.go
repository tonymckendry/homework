package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sort"
	"io/ioutil"
)

const (
	crlf       = "\r\n"
	colonspace = ": "
)

func ChecksumMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {		
		// your code goes here ...
		h.ServeHTTP(w,r)
		s := ""
		s += strconv.Itoa(http.StatusTeapot)
		s += "\r\n"
		var sortedHeaderKeys []string
		for k:= range w.Header() {
			sortedHeaderKeys = append(sortedHeaderKeys, k)
		}
		sort.Strings(sortedHeaderKeys)
		for hh := range sortedHeaderKeys {
			key:= sortedHeaderKeys[hh]
			headerString := key 
			headerString += ": "
			headerString += strings.Join(w.Header()[key],"")
			s += headerString
			s += "\r\n"
		}
		s += "X-Checksum-Headers: "
		for hh := range sortedHeaderKeys {
			s += sortedHeaderKeys[hh]
			s+= ";"
		}
		s += "\r\n\r\n"
		responseData, err := ioutil.ReadAll(r.Body)
        if err != nil {
			fmt.Println("*************ERROR*************")
            log.Fatal(err)
		}
		fmt.Println("responseData")
		fmt.Println(string(responseData))
		s+= string(responseData)

		fmt.Println("s")
		fmt.Println(s)
	})
}



// Do not change this function.
func main() {
	var listenAddr = flag.String("http", "localhost:8080", "address to listen on for HTTP")
	flag.Parse()

	l := log.New(os.Stderr, "", 1)

	http.Handle("/", ChecksumMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l.Printf("%s - %s", r.Method, r.URL)
		w.Header().Set("X-Foo", "bar")
		w.Header().Set("Content-Type", "text/plain")
		w.Header().Set("Date", "Sun, 08 May 2016 14:04:53 GMT")
		msg := "Curiosity is insubordination in its purest form.\n"
		w.Header().Set("Content-Length", strconv.Itoa(len(msg)))
		fmt.Fprintf(w, msg)
	})))

	log.Fatal(http.ListenAndServe(*listenAddr, nil))
}

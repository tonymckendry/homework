package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"strings"
	"sort"
	"io"
	"io/ioutil"
	"crypto/sha1"
	"encoding/hex"
)

const (
	crlf       = "\r\n"
	colonspace = ": "
)

func ChecksumMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {		
		// your code goes here ...
		war := httptest.NewRecorder()
		h.ServeHTTP(war,r)
		s := ""
		s += strconv.Itoa(http.StatusTeapot)
		w.WriteHeader(http.StatusTeapot)
		s += "\r\n"
		var sortedHeaderKeys []string
		for k:= range war.Header() {
			sortedHeaderKeys = append(sortedHeaderKeys, k)
		}
		sort.Strings(sortedHeaderKeys)
		for hh := range sortedHeaderKeys {
			key:= sortedHeaderKeys[hh]
			headerString := key 
			headerString += ": "
			headerString += strings.Join(war.Header()[key],"")
			s += headerString
			s += "\r\n"
			w.Header()[key] = war.Header()[key]
		}
		s += "X-Checksum-Headers: "
		for hh := range sortedHeaderKeys {
			s += sortedHeaderKeys[hh]
			s+= ";"
		}
		s += "\r\n\r\n"
		responseData, err := ioutil.ReadAll(war.Body)
        if err != nil {
            log.Fatal(err)
		}
		s+= string(responseData)

		w.Write(responseData)

		checksum := sha1.New()
		io.WriteString(checksum, s)
		w.Header().Set("X-Checksum", hex.EncodeToString(checksum.Sum(nil)))
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

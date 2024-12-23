package tplt

import (
	"html/template"
	"log"
	"net/http"
)

func RenderTemplate(w http.ResponseWriter, name string, data interface{}) error {
	tmpl, err := template.ParseFiles("./templates/" + name + ".html")
	if err != nil {
		log.Printf("HandlePrintLabel() => Error while parsing file err=[%v]", err)
		return err
	}

	if err := tmpl.Execute(w, data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("HandlePrintLabel() => Error while executing data err=[%v]", err)
		return err
	}

	return nil
}

func RenderNotFoundPage(w http.ResponseWriter) {
	err := RenderTemplate(w, "404", nil)
	if err != nil {
		log.Printf("RenderNotFoundPage(): Error while rendering 404 template, err=[%v]", err)
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 Not found"))
		return
	}
}

func RenderInternalErrorPage(w http.ResponseWriter) {
	err := RenderTemplate(w, "500", nil)
	if err != nil {
		log.Printf("RenderInternalErrorPage(): Error while rendering 500 template, err=[%v]", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("500 Internal server error"))
		return
	}
}

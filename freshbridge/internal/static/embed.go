package static

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed web/*
var webDir embed.FS

// Handler serves the embedded H5 frontend with SPA fallback.
func Handler() http.Handler {
	sub, _ := fs.Sub(webDir, "web")
	fileServer := http.FileServer(http.FS(sub))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")

		// Serve exact file if it exists
		if f, err := sub.Open(path); err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		// SPA fallback: everything else → index.html
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	})
}

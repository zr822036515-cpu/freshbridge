package static

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed web
var webDir embed.FS

//go:embed admin
var adminDir embed.FS

// Handler serves the embedded H5 frontend with SPA fallback.
func Handler() http.Handler {
	sub, _ := fs.Sub(webDir, "web")
	fileServer := http.FileServer(http.FS(sub))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// Don't intercept admin panel
		if strings.HasPrefix(path, "/admin") {
			http.NotFound(w, r)
			return
		}

		// Serve exact file if it exists
		trimmed := strings.TrimPrefix(path, "/")
		if f, err := sub.Open(trimmed); err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		// SPA fallback
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	})
}

// AdminFS returns the embedded admin panel filesystem.
func AdminFS() http.FileSystem {
	sub, _ := fs.Sub(adminDir, "admin")
	return http.FS(sub)
}

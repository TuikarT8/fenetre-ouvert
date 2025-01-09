package rest

import "net/http"

func getAuthorFromRequest(r *http.Request) Author {
	user := r.Context().Value("user").(User)
	return Author{
		Name: user.GetUserFullName(),
		Id:   user.Id,
	}
}

func mapSlice[I any, O any](slice []I, callbackFn func(element I, index int) O) []O {
	output := make([]O, 0)

	for idx, i := range slice {
		o := callbackFn(i, idx)
		output = append(output, o)
	}

	return output
}

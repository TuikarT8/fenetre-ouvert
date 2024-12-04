package rest

import (
	"fmt"
	"net/http"
	"strconv"
)

type PageQueryParams struct {
	skip  int64
	count int64
}

func pageQueryFromRequestQueryParams(r *http.Request) (PageQueryParams, error) {
	skip := r.URL.Query().Get("skip")
	count := r.URL.Query().Get("count")

	if skip == "" {
		skip = "0"
	}

	if count == "" {
		count = "250"
	}

	return paramsToQueryParams(skip, count)
}

func paramsToQueryParams(skip string, count string) (PageQueryParams, error) {
	var params PageQueryParams

	skipInt, err := strconv.Atoi(skip)
	if err != nil {
		return params, err
	}

	countInt, err := strconv.Atoi(count)
	if err != nil {
		return params, err
	}

	if countInt < 0 || skipInt < 0 {
		return params, fmt.Errorf("pagination parameters cannot be negative")
	}

	params.count = int64(countInt)
	params.skip = int64(skipInt)

	return params, nil
}

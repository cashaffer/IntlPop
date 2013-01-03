RM = rm
CAT = cat
TARGET = build
CSSLINTFLAGS = --quiet --errors=empty-rules,import,errors --warnings=duplicate-background-images,compatible-vendor-prefixes,display-property-grouping,fallback-colors,duplicate-properties,shorthand,gradients,font-sizes,floats,overqualified-elements,import,regex-selectors,rules-count,unqualified-attributes,vendor-prefix,zero-units
FETCH = .git/FETCH_HEAD

all: build

build: version.js

$(FETCH):

version.txt: $(FETCH)
	git describe --tags --long | awk '{ printf "%s", $$0 }' - > version.txt

version.js :version1.txt version.txt version2.txt
	$(CAT) version1.txt version.txt version2.txt > version.js

clean:
	- $(RM) *~

lint: csslint jshint

csslint:
	@echo 'running csslint'
	@csslint $(CSSLINTFLAGS) *.css

jshint:
	@echo 'running jshint'
	@jshint *.js

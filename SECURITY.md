# Security

This is a static reader. It does not require secrets, reader accounts or an application server. Local browser storage contains reading preferences, bookmarks and saved passage IDs.

If you find a vulnerability in the shared reader, use GitHub's **Security → Report a vulnerability** where available. Do not put credentials or a working exploit against someone else's deployment in a public issue. No response-time or supported-version guarantee is offered.

Edition files are maintainer-authored inputs. Markdown is sanitized and source text is escaped; build-time source paths are constrained to the edition directory. Review changes to manifests, build scripts, dependencies and workflow files before merging. GitHub Actions has read-only repository permissions and no deployment secrets. The hosting provider handles TLS and ordinary request logs.

The default Content Security Policy permits same-origin scripts, images, fonts and content. Inline styles are allowed for reader preferences. If you alter it, review the resulting trust boundary. This repository is not a general-purpose service for running or hosting untrusted user uploads.

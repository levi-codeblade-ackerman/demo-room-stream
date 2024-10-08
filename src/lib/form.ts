// this action (https://svelte.dev/tutorial/actions) allows us to
// progressively enhance a <form> that already works without JS

type EnhanceOptions = {
    pending?: (body: FormData, form: HTMLFormElement) => void;
    error?: (res: Response | null, error: Error | null, form: HTMLFormElement) => void;
    result?: (res: Response, form: HTMLFormElement) => void;
};

export function enhance(form: HTMLFormElement, { pending, error, result }: EnhanceOptions) {
    let current_token: object;

    async function handle_submit(e: Event) {
        const token = (current_token = {});

        e.preventDefault();

        const body = new FormData(form);

        if (pending) pending(body, form);

        try {
            const res = await fetch(form.action, {
                method: form.method,
                headers: {
                    accept: 'application/json'
                },
                body
            });

            if (token !== current_token) return;

            if (res.ok) {
                if (result) result(res, form);
            } else if (error) {
                error(res, null, form);
            } else {
                console.error(await res.text());
            }
        } catch (e) {
            if (error) {
                error(null, e as Error, form);
            } else {
                throw e;
            }
        }
    }

    form.addEventListener('submit', handle_submit);

    return {
        destroy() {
            form.removeEventListener('submit', handle_submit);
        }
    };
}
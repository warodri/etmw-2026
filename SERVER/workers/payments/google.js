
//  https://chatgpt.com/c/691f0479-4930-832b-94f7-f5ecafe6cbe0

export async function action(app) {

    app.post('/pay', async (req, res) => {
        const { token, amount } = req.body;
        const charge = await stripe.charges.create({
            amount,
            currency: 'gbp',
            source: token.id,
            description: 'Google Pay Purchase'
        });
        res.json({ success: true, charge });
    });

}
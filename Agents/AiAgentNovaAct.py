from nova_act import NovaAct

with NovaAct(
        starting_page="http://localhost:8080/"
) as nova:
    # Simulate extremely fast typing
    nova.act("Type 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' into the input box and click send.")


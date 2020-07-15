import os
import boto3
import random
import json
import datetime

appconfig_client = boto3.client('appconfig')

# Some variables
quotes_sh = [
    "Bolje zivjeti 100 godina kao milijunas, nego 7 dana u bijedi.",
    "Nije vazno sudjelovati, vazno je pobijediti.",
    "Ako kanis pobijediti, ne smijes izgubiti.",
    "Tko spava nije budan.",
    "Naoruzaj se i bjezi.",
    "Bolje nesto od necega, nego nista od nicega.",
    "Ako zelite pobijediti u trci, morate prvi proci kroz cilj.",
    "Ne predaj se nikad, osim kad moras.",
    "Alane, bjez’mo, njih je dvojica, a mi smo sami!",
    "Prokletstvo, ovaj zid je gladak poput glatkog zida.",
    "Mi nista ne obecavamo i to ispunjavamo – stranka istine",
    "Ovdje pociva onaj koga vise nema.",
    "Ovdje lezim ja a stojis ti, a bilo bi bolje da lezis ti a stojim ja",
    "Mene ce najvise pogoditi moja vlastita smrt!",
    "Bolje biti bogat nego ne biti.",
    "Dolje oni zivio ja",
    "Kupite cvijece voljenoj zeni, ali ne zaboravite i na vlastitu.",
    "Poznati sicilijanski odvjetnik tvrdi da je sve to plod policijske maste.",
    "Ne vjeruj zeni koja laze.",
    "Tko hoda ne trci.",
    "Ko leti, vrijedi, ko vrijedi, leti, ko ne leti, ne vrijedi.",
    "Bolje izdati knjigu nego prijatelja.",
    "Ovdje lezi, ne bjezi jer nije svjezi.",
    "Mozda po nacionalnosti nizozemac, al’ preci su mu sigurno bili francuzi.",
    "Za domovinu cu dati sve, pa cak i nokat.",
    "Ulaz slobodan, izlaz se naplacuje.",
    "Halo, Bing, kako brat? Ukrao auto, a onda mu ga zdipili na prvom parkiralistu? Kakva vremena…",
    "Udjelite sirotom starcu bez nogu koji nema novaca ni cipele da kupi.",
    "Bolje takticki uzmak nego krvavi poraz.",
    "Bolje piti vodu nego naftu.",
    "Tko lezi, ne bjezi.",
    "Bolje kukavicki pobjeci nego junacki poginuti.",
    "Bolje ispasti budala, nego ispasti iz vlaka.",
    "Natpis iznad kina: Ulaz-slijepi 50 centi, gluhi 50 centi, slijepi i gluhi 1 dolar!",
    "Tko izgubi dobitak dobije gubitak!"
]

quotes_en = [
    "Better to live 100 years a sa millionare, than 7 days in misery",
    "It is not important to partake in something, it is important to win",
    "If you wish to win, you cannot lose",
    "The one who sleeps is not awake",
    "Arm yourself and run",
    "Better something from something, than nothing from nothing",
    "If you wish to win in a race, you must be the first one through the finish line",
    "Do not give up, unless you have to",
    "Alane, we need to run! There are two of them, and we are all alone!",
    "Drats, this wall is a smooth as a smooth wall",
    "We promise nothing - and that we fulfill - the party of Truth",
    "Here lies the one who is no longer",
    "Here I lie and you stand, but it would be better that you lie and I stand",
    "I will be most impacted by my own death",
    "It's better to be rich than not to be",
    "Down with them, long live I",
    "Make sure to buy flowers to Your loved woman, and do not forget your wife",
    "Famous Sicilian lawyer claims, that it is all a figment of the police immagination",
    "Do not trust a woman that lies",
    "The one who walks does not run",
    "Who flies is worthy, who is worthy files, who does not fly is not worthy",
    "I will give everything for my country, even my fingernail",
    "Entry is free, exit is charged",
    "Better a tactical retreat that an bloody defeat",
    "It's better to drink water than gasoline",
    "Who lies, does not run",
    "Better to run away a cowardm, than die a hero",
    "Who loses a win, wins a loss"
]


def lambda_handler(event, context):
    config = appconfig_client.get_configuration(
        Application=os.environ['CONFIG_APP'],
        Environment=os.environ['CONFIG_ENV'],
        Configuration=os.environ['CONFIG_CONFIG'],
        ClientId=context.function_name
    )
    return_items = json.loads(config['Content'].read().decode('utf-8'))

    return_limit = return_items['intResultLimit']
    return_language = return_items['language']

    if not return_items['boolEnableLimitResults']:
        return_limit = 2

    if return_language == 'sh':
        quotes = quotes_sh
    else:
        quotes = quotes_en

    data = {
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'env': os.environ['CONFIG_ENV'],
        'data': random.sample(quotes, return_limit),
    }

    # --- chaos ---
    if return_items['chaos']:
        if random.random() < 0.2:
            status_code = 500
            data = {"message": "ERROR - The monkey is in the tank"}
        else:
            status_code = 200
    else:
        status_code = 200

    return {
        "statusCode": status_code,
        "isBase64Encoded": 'false',
        "headers": {'Content-Type': 'application/json'},
        "body": json.dumps(data),
    }

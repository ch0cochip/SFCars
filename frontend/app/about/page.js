import Image from "next/image";

const About = () => {
  return (
    <div>
      <div className="mb-12">
        <h2 className="max-w-sm mx-auto text-center text-teal-400 font-medium text-2xl mb-4">
          WHO WE ARE
        </h2>
        <p className="mx-auto text-justify">
          Our story started at Bondi beach a few years back. Our co-founder Lisa
          was trying to park at Bondi Beach. Having circled the block for nearly
          an hour trying to find a spot, she pulled up outside someone’s
          driveway and asked the owner if she could park in his driveway for the
          afternoon for $20. The owner said yes… and his name was Oscar!
        </p>
      </div>
      <div className="flex gap-12">
        <div className="flex flex-1 bg-white px-8 flex-col justify-between gap-4">
          <span className="bg-slate-300 py-1"></span>
          <div className="flex flex-col gap-4">
            <Image
              className="place-self-center"
              alt="Our Mission"
              src="/assets/icons/Rocket.svg"
              width={75}
              height={75}
            />
            <h3 className="mx-auto text-center font-bold text-lg">
              Our Mission
            </h3>
            <p className="mx-auto text-left">
              At Oscar, Our mission is to make our cities more liveable through
              sharing. We’re changing the way we share our infrastructure and
              resources when we don’t use them, to create greener, smarter, and
              more liveable cities.
            </p>
          </div>
          <span className="bg-slate-300 py-1"></span>
        </div>
        <div className="flex flex-1 bg-white px-8 flex-col justify-between gap-4">
          <span className="bg-slate-300 py-1"></span>
          <div className="flex flex-col gap-4">
            <Image
              className="place-self-center"
              src="/assets/icons/Rocket.svg"
              alt="Our Story"
              width={75}
              height={75}
            />
            <h3 className="mx-auto text-center font-bold text-lg">Our Story</h3>
            <p className="mx-auto text-left">
              Oscar was developed to help alleviate the pain of searching for
              parking in crowded areas. The idea came about when our co-founder
              Lisa felt the stress and frustration of finding parking at Bondi
              beach, and yet saw so many empty driveways dotted around.
            </p>
          </div>
          <span className="bg-slate-300 py-1"></span>
        </div>
        <div className="flex flex-1 bg-white px-8 flex-col justify-between gap-4">
          <span className="bg-slate-300 py-1"></span>
          <div className="flex flex-col gap-4">
            <Image
              className="place-self-center"
              src="/assets/icons/Rocket.svg"
              alt="Our Name"
              width={75}
              height={75}
            />
            <h3 className="text-center font-bold text-lg">Our Name</h3>
            <p className="mx-auto text-left">
              Share with Oscar. It’s a bit of an odd name for a parking app. A
              question we’re asked all the time is ‘how did you come up with
              your company name’?…
            </p>
          </div>
          <span className="bg-slate-300 py-1"></span>
        </div>
      </div>
    </div>
  );
};

export default About;
